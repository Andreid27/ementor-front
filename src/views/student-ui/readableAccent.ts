// ** MUI Imports
import { darken, lighten, Theme } from '@mui/material/styles'

/*
 * The theme green (#28C76F) reaches only 2.2:1 against white, below the 4.5:1
 * WCAG AA needs for text and the 3:1 it needs for icons. The student dashboard
 * keeps the brand hue but uses deeper shades where green carries meaning.
 */

/** Green for text and icons on light or lightly tinted surfaces (about 5:1 on the tint). */
export const accentInk = (theme: Theme) =>
  theme.palette.mode === 'light' ? darken(theme.palette.primary.main, 0.4) : theme.palette.primary.light

/** Fill for solid green controls with white content on them (4.9:1 for white text). */
export const accentFill = (theme: Theme) => darken(theme.palette.primary.main, 0.35)

export const accentFillHover = (theme: Theme) => darken(theme.palette.primary.main, 0.45)

/**
 * Text and icon colour for any palette colour shown on a light tint of itself,
 * as status pills are. The bright theme colours (green, orange, cyan) fall
 * between 1.8:1 and 2.6:1 there; these shades reach at least 4.5:1.
 */
export const toneInk = (theme: Theme, color: string) =>
  theme.palette.mode === 'light' ? darken(color, 0.45) : lighten(color, 0.4)

/** The tint that goes behind toneInk. */
export const toneWash = (theme: Theme) => (theme.palette.mode === 'light' ? 0.12 : 0.16)

/** A solid green call to action: at least 44px tall, full width on phones. */
export const accentButtonSx = {
  minHeight: 44,
  px: 5,
  fontWeight: 600,
  boxShadow: 'none',
  width: { xs: '100%', sm: 'auto' },
  bgcolor: accentFill,
  '&:hover': { bgcolor: accentFillHover, boxShadow: 'none' }
}
