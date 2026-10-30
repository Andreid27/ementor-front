// ** MUI Imports
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { motion, useReducedMotion } from 'framer-motion'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

// The violet the 3D illustrations are dressed in, so the confetti belongs to them.
const ILLUSTRATION_VIOLET = '#8479F2'

interface CelebrationBurstProps {
  /** Number of pieces; they spread evenly around the circle. */
  pieces?: number

  /** How far the outer ring of pieces travels, in px. */
  reach?: number
  delay?: number
}

/**
 * A one-shot burst of confetti from the centre of its parent. The parent must
 * be positioned; the burst never takes space or pointer events, and it is not
 * rendered at all when the person asked for reduced motion.
 */
const CelebrationBurst = ({ pieces = 14, reach = 64, delay = 0 }: CelebrationBurstProps) => {
  const theme = useTheme()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return null

  const colors = [theme.palette.primary.main, theme.palette.warning.main, theme.palette.info.main, ILLUSTRATION_VIOLET]

  return (
    <span
      aria-hidden
      style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, pointerEvents: 'none', zIndex: 3 }}
    >
      {Array.from({ length: pieces }, (_, index) => {
        const angle = (index / pieces) * Math.PI * 2 + (index % 2 ? 0.2 : 0)
        const distance = index % 2 === 0 ? reach : reach * 0.62
        const size = index % 3 === 0 ? 8 : 6

        return (
          <motion.span
            key={index}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 10,
              opacity: 0,
              scale: 0.5,
              rotate: index % 2 ? 140 : -140
            }}
            transition={{ duration: 0.95, ease: EASE_OUT, delay }}
            style={{
              position: 'absolute',
              left: -size / 2,
              top: -size / 2,
              width: size,
              height: index % 3 === 1 ? size * 0.5 : size,
              borderRadius: index % 3 === 2 ? '50%' : 2,
              background: colors[index % colors.length]
            }}
          />
        )
      })}
    </span>
  )
}

export default CelebrationBurst
