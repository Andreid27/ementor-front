// ** React Imports
import React, { useEffect, useRef } from 'react'

// ** MUI Imports
import GlobalStyles, { GlobalStylesProps } from '@mui/material/GlobalStyles'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types
import type { BlockedAction } from './integrity/integrityTypes'

/**
 * QuizContentProtection - Stops students from copying, pasting, printing or saving the quiz questions
 *
 * Renders nothing on the page. While it is mounted, text cannot be selected or dragged, the right-click menu,
 * clipboard, print, save-page and developer-tools shortcuts are blocked, and printing shows a notice instead
 * of the page. Everything is removed on unmount, so the rest of the app is not affected.
 *
 * It only makes these things harder: the browser menu, a screenshot or a phone camera still get past it.
 * Every blocked action is reported through onBlocked, so the quiz integrity record can include it.
 */

interface QuizContentProtectionProps {
  onBlocked?: (action: BlockedAction) => void
}

const BLOCKED_MESSAGE = 'Această acțiune nu este permisă pe pagina testului.'
const PRINT_MESSAGE = 'Printarea testului nu este permisă.'
const TOAST_ID = 'quiz-content-protection'

const protectionStyles: GlobalStylesProps['styles'] = {
  body: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none'
  },

  // Safari will not let you type into a field that inherits user-select: none
  'input, textarea, [contenteditable="true"]': {
    userSelect: 'text',
    WebkitUserSelect: 'text'
  },

  '@media print': {
    'body > *': {
      display: 'none !important'
    },
    'body::after': {
      content: `"${PRINT_MESSAGE}"`,
      display: 'block',
      padding: '48px 24px',
      fontSize: '16pt',
      textAlign: 'center'
    }
  }
}

const getBlockedShortcut = (event: KeyboardEvent): BlockedAction | null => {
  if (event.key === 'F12') return 'DEVTOOLS_SHORTCUT'

  if (event.metaKey && event.altKey) {
    // macOS Cmd+Option: developer tools (I, J, C), page source (U) and the system print dialog (P).
    // Option changes event.key on macOS (Option+I types "ˆ"), so the physical key is checked instead.
    if (['KeyI', 'KeyJ', 'KeyC'].includes(event.code)) return 'DEVTOOLS_SHORTCUT'
    if (event.code === 'KeyU') return 'VIEW_SOURCE_SHORTCUT'

    return event.code === 'KeyP' ? 'PRINT_SHORTCUT' : null
  }

  // AltGr arrives as Ctrl+Alt on Windows and types letters such as "î", so it is never blocked
  if ((!event.ctrlKey && !event.metaKey) || event.altKey) return null

  const key = event.key.toLowerCase()

  // With Shift: developer tools (I, J, C), the system print dialog (P) and the Firefox screenshot tool (S).
  // Ctrl+Shift+U stays free because Linux uses it to type Unicode characters.
  if (event.shiftKey) {
    if (['i', 'j', 'c'].includes(key)) return 'DEVTOOLS_SHORTCUT'
    if (key === 'p') return 'PRINT_SHORTCUT'

    return key === 's' ? 'SCREENSHOT_SHORTCUT' : null
  }

  // Print, save page and page source
  if (key === 'p') return 'PRINT_SHORTCUT'
  if (key === 's') return 'SAVE_SHORTCUT'

  return key === 'u' ? 'VIEW_SOURCE_SHORTCUT' : null
}

const QuizContentProtection: React.FC<QuizContentProtectionProps> = ({ onBlocked }) => {
  // The listeners are added once, so they read the latest callback from a ref
  const onBlockedRef = useRef(onBlocked)

  useEffect(() => {
    onBlockedRef.current = onBlocked
  })

  useEffect(() => {
    const notify = () => {
      toast.error(BLOCKED_MESSAGE, { id: TOAST_ID })
    }

    const report = (action: BlockedAction) => onBlockedRef.current?.(action)

    const blockAs = (action: BlockedAction) => (event: Event) => {
      event.preventDefault()
      notify()
      report(action)
    }

    const blockCopy = blockAs('COPY')
    const blockCut = blockAs('CUT')
    const blockPaste = blockAs('PASTE')

    const blockShortcut = (event: KeyboardEvent) => {
      const action = getBlockedShortcut(event)
      if (!action) return

      event.preventDefault()
      notify()

      // Holding the keys down repeats keydown, but it is one attempt
      if (!event.repeat) report(action)
    }

    const blockContextMenu = (event: MouseEvent) => {
      event.preventDefault()

      // A long press opens the menu on Android; staying silent there avoids a warning after a slow tap
      if ((event as PointerEvent).pointerType !== 'touch') notify()
      report('CONTEXT_MENU')
    }

    const blockDrag = (event: DragEvent) => {
      event.preventDefault()
      report('DRAG')
    }

    // Print from the browser menu cannot be cancelled, but the print styles above leave only the notice
    const onPrint = () => {
      notify()
      report('PRINT_DIALOG')
    }

    // Capture phase on window runs before any handler on the page
    window.addEventListener('copy', blockCopy, true)
    window.addEventListener('cut', blockCut, true)
    window.addEventListener('paste', blockPaste, true)
    window.addEventListener('keydown', blockShortcut, true)
    window.addEventListener('contextmenu', blockContextMenu, true)
    window.addEventListener('dragstart', blockDrag, true)
    window.addEventListener('beforeprint', onPrint)

    return () => {
      window.removeEventListener('copy', blockCopy, true)
      window.removeEventListener('cut', blockCut, true)
      window.removeEventListener('paste', blockPaste, true)
      window.removeEventListener('keydown', blockShortcut, true)
      window.removeEventListener('contextmenu', blockContextMenu, true)
      window.removeEventListener('dragstart', blockDrag, true)
      window.removeEventListener('beforeprint', onPrint)
    }
  }, [])

  return <GlobalStyles styles={protectionStyles} />
}

export default QuizContentProtection
