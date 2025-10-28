/**
 * Enhanced Responsive Design Example Component
 *
 * This component demonstrates the implementation of the enhanced responsive design system
 * with mobile-first approach and progressive enhancement. It serves as a reference
 * implementation for all requirements.
 *
 * Requirements demonstrated:
 * - 8.1: Mobile-first responsive design with progressive enhancement
 * - 8.2: Minimum 48px touch targets on mobile devices
 * - 8.3: Mobile typography and spacing matching desktop quality
 * - 8.5: Adaptive layouts for all screen sizes
 */

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  LinearProgress,
  Chip,
  Stack,
  Grid,
  useTheme,
  alpha
} from '@mui/material'
import { styled } from '@mui/material/styles'

// Enhanced responsive hooks
import { useEnhancedResponsive, useEnhancedQuizInterface } from '../hooks/useEnhancedResponsive'
import { useResponsiveTheme } from '../theme/responsiveTheme'

// Import responsive CSS
import '../styles/responsive.css'

// Styled components demonstrating mobile-first responsive design
const ResponsiveContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  padding: theme.spacing(2), // Mobile first (16px)

  // Progressive enhancement for tablets
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3) // 24px
  },

  // Progressive enhancement for desktop
  [theme.breakpoints.up('md')]: {
    maxWidth: '1200px',
    padding: theme.spacing(4) // 32px
  }
}))

const TouchOptimizedCard = styled(Card)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
  marginBottom: theme.spacing(3), // Mobile first
  borderRadius: theme.spacing(1), // 8px mobile
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  transition: 'all 200ms ease-out', // Mobile-optimized animation

  // Progressive enhancement for tablets
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(3.5),
    borderRadius: theme.spacing(1.5), // 12px tablet
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },

  // Progressive enhancement for desktop
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(4),
    borderRadius: theme.spacing(2), // 16px desktop
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
  },

  // Hover effects only on devices that support hover
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
    }
  },

  // Touch feedback for mobile devices
  '@media (hover: none) and (pointer: coarse)': {
    '&:active': {
      transform: 'scale(0.98)',
      transition: 'transform 0.1s ease-out'
    }
  }
}))

const TouchTargetButton = styled(Button)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
  minHeight: 44, // iOS minimum
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(1),
  fontSize: '0.875rem',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 200ms ease-out',

  // Ensure 48px minimum on mobile (Requirement 8.2)
  [theme.breakpoints.down('sm')]: {
    minHeight: 48, // Android minimum
    padding: theme.spacing(2, 4),
    fontSize: '0.875rem'
  },

  // Comfortable size on tablets
  [theme.breakpoints.between('sm', 'md')]: {
    minHeight: 52,
    padding: theme.spacing(1.75, 3.5),
    fontSize: '0.95rem'
  },

  // Standard size on desktop
  [theme.breakpoints.up('md')]: {
    minHeight: 44,
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem'
  },

  // Touch feedback
  '@media (hover: none) and (pointer: coarse)': {
    '&:active': {
      transform: 'scale(0.98)'
    }
  },

  // Hover effects
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4]
    }
  }
}))

const ResponsiveRadioOption = styled(FormControlLabel)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
  minHeight: 48, // Ensure 48px minimum (Requirement 8.2)
  margin: theme.spacing(0.75, 0),
  padding: theme.spacing(1.5, 2),
  border: '2px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 200ms ease-out',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginLeft: 0,
  marginRight: 0,

  // Progressive enhancement for tablets
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.75, 2.5),
    margin: theme.spacing(1, 0)
  },

  // Progressive enhancement for desktop
  [theme.breakpoints.up('md')]: {
    minHeight: 44, // Can be smaller on desktop
    padding: theme.spacing(2, 3),
    margin: theme.spacing(1.25, 0)
  },

  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    lineHeight: 1.4,
    flex: 1,

    [theme.breakpoints.up('sm')]: {
      fontSize: '1rem',
      lineHeight: 1.5
    }
  },

  // Touch feedback
  '@media (hover: none) and (pointer: coarse)': {
    '&:active': {
      transform: 'scale(0.98)',
      backgroundColor: alpha(theme.palette.primary.main, 0.05)
    }
  },

  // Hover effects
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.02),
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  }
}))

const ResponsiveExample: React.FC = () => {
  const theme = useTheme()
  const responsive = useEnhancedResponsive()
  const quizInterface = useEnhancedQuizInterface()
  const { styles } = useResponsiveTheme()

  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [progress, setProgress] = useState(65)

  // Demonstrate responsive typography (Requirement 8.3)
  const displayTypography = responsive.getTypography('DISPLAY')
  const bodyLargeTypography = responsive.getTypography('BODY_LARGE')
  const bodyRegularTypography = responsive.getTypography('BODY_REGULAR')
  const captionTypography = responsive.getTypography('CAPTION')

  return (
    <ResponsiveContainer>
      {/* Device Information Display */}
      <TouchOptimizedCard>
        <CardContent>
          <Typography
            variant='h5'
            component='h1'
            sx={{
              fontSize: displayTypography.fontSize,
              lineHeight: displayTypography.lineHeight,
              fontWeight: displayTypography.fontWeight,
              marginBottom: responsive.getSpacing('MD'),
              color: theme.palette.text.primary
            }}
          >
            Enhanced Responsive Design Demo
          </Typography>

          <Stack spacing={2} direction={responsive.isMobile ? 'column' : 'row'} flexWrap='wrap'>
            <Chip
              label={`Device: ${responsive.deviceType}`}
              color='primary'
              size={responsive.isMobile ? 'medium' : 'small'}
            />
            <Chip
              label={`Screen: ${responsive.screenWidth}×${responsive.screenHeight}`}
              color='secondary'
              size={responsive.isMobile ? 'medium' : 'small'}
            />
            <Chip
              label={`Touch: ${responsive.isTouchDevice ? 'Yes' : 'No'}`}
              color={responsive.isTouchDevice ? 'success' : 'default'}
              size={responsive.isMobile ? 'medium' : 'small'}
            />
            <Chip
              label={`Hover: ${responsive.supportsHover ? 'Yes' : 'No'}`}
              color={responsive.supportsHover ? 'success' : 'default'}
              size={responsive.isMobile ? 'medium' : 'small'}
            />
            <Chip
              label={`Orientation: ${responsive.orientation}`}
              color='info'
              size={responsive.isMobile ? 'medium' : 'small'}
            />
          </Stack>
        </CardContent>
      </TouchOptimizedCard>

      {/* Progress Card Example */}
      <Box sx={styles.quizProgressCard}>
        <Typography
          variant='h6'
          sx={{
            fontSize: bodyLargeTypography.fontSize,
            lineHeight: bodyLargeTypography.lineHeight,
            fontWeight: 600,
            marginBottom: responsive.getSpacing('SM')
          }}
        >
          Quiz Progress Example
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant='determinate'
              value={progress}
              sx={{
                height: responsive.isMobile ? 6 : 8,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: theme.palette.primary.main
                }
              }}
            />
          </Box>
          <Typography
            variant='caption'
            sx={{
              fontSize: captionTypography.fontSize,
              lineHeight: captionTypography.lineHeight,
              fontWeight: 600,
              color: theme.palette.text.primary,
              minWidth: 'fit-content'
            }}
          >
            {progress}%
          </Typography>
        </Box>

        <Typography
          variant='caption'
          sx={{
            fontSize: captionTypography.fontSize,
            lineHeight: captionTypography.lineHeight,
            color: theme.palette.text.secondary
          }}
        >
          Touch target size: {responsive.getTouchTarget()}px (min: {responsive.getMinTouchTarget()}px)
        </Typography>
      </Box>

      {/* Question Card Example */}
      <TouchOptimizedCard>
        <CardContent>
          <Typography
            variant='caption'
            sx={{
              fontSize: captionTypography.fontSize,
              lineHeight: captionTypography.lineHeight,
              color: theme.palette.text.secondary,
              marginBottom: responsive.getSpacing('SM'),
              display: 'block'
            }}
          >
            Întrebarea 1 din 5
          </Typography>

          <Typography
            variant='body1'
            component='h3'
            sx={{
              fontSize: bodyLargeTypography.fontSize,
              lineHeight: bodyLargeTypography.lineHeight,
              fontWeight: 500,
              color: theme.palette.text.primary,
              marginBottom: responsive.getSpacing('LG')
            }}
          >
            Care este principiul fundamental al design-ului responsive mobile-first?
          </Typography>

          <RadioGroup value={selectedAnswer} onChange={e => setSelectedAnswer(e.target.value)} sx={{ gap: 0 }}>
            {[
              { value: 'a', label: 'A. Începi cu design-ul pentru desktop și apoi adaptezi pentru mobile' },
              {
                value: 'b',
                label: 'B. Începi cu design-ul pentru mobile și apoi îmbunătățești progresiv pentru ecrane mai mari'
              },
              { value: 'c', label: 'C. Creezi design-uri separate pentru fiecare dispozitiv' },
              { value: 'd', label: 'D. Folosești doar unități fixe pentru toate dimensiunile' }
            ].map(option => (
              <ResponsiveRadioOption
                key={option.value}
                value={option.value}
                control={
                  <Radio
                    sx={{
                      padding: responsive.isMobile ? theme.spacing(1.5) : theme.spacing(1),
                      '& .MuiSvgIcon-root': {
                        fontSize: responsive.isMobile ? 24 : 20
                      }
                    }}
                  />
                }
                label={option.label}
                sx={{
                  borderColor: selectedAnswer === option.value ? theme.palette.primary.main : '#e0e0e0',
                  backgroundColor:
                    selectedAnswer === option.value ? alpha(theme.palette.primary.main, 0.04) : 'transparent'
                }}
              />
            ))}
          </RadioGroup>
        </CardContent>
      </TouchOptimizedCard>

      {/* Typography Examples */}
      <TouchOptimizedCard>
        <CardContent>
          <Typography
            variant='h6'
            sx={{
              fontSize: bodyLargeTypography.fontSize,
              lineHeight: bodyLargeTypography.lineHeight,
              fontWeight: 600,
              marginBottom: responsive.getSpacing('MD')
            }}
          >
            Responsive Typography Examples (Requirement 8.3)
          </Typography>

          <Stack spacing={responsive.getSpacing('SM')}>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Display Typography:
              </Typography>
              <Typography
                sx={{
                  fontSize: displayTypography.fontSize,
                  lineHeight: displayTypography.lineHeight,
                  fontWeight: displayTypography.fontWeight
                }}
              >
                Quiz Title Example
              </Typography>
            </Box>

            <Box>
              <Typography variant='caption' color='text.secondary'>
                Body Large (Questions):
              </Typography>
              <Typography
                sx={{
                  fontSize: bodyLargeTypography.fontSize,
                  lineHeight: bodyLargeTypography.lineHeight,
                  fontWeight: bodyLargeTypography.fontWeight
                }}
              >
                This is how question text appears with optimized typography for {responsive.deviceType} devices.
              </Typography>
            </Box>

            <Box>
              <Typography variant='caption' color='text.secondary'>
                Body Regular (Answers):
              </Typography>
              <Typography
                sx={{
                  fontSize: bodyRegularTypography.fontSize,
                  lineHeight: bodyRegularTypography.lineHeight,
                  fontWeight: bodyRegularTypography.fontWeight
                }}
              >
                This is how answer options appear with mobile-optimized typography.
              </Typography>
            </Box>

            <Box>
              <Typography variant='caption' color='text.secondary'>
                Caption (Metadata):
              </Typography>
              <Typography
                sx={{
                  fontSize: captionTypography.fontSize,
                  lineHeight: captionTypography.lineHeight,
                  fontWeight: captionTypography.fontWeight,
                  color: theme.palette.text.secondary
                }}
              >
                Progress indicators and metadata use this typography style.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </TouchOptimizedCard>

      {/* Adaptive Layout Example (Requirement 8.5) */}
      <TouchOptimizedCard>
        <CardContent>
          <Typography
            variant='h6'
            sx={{
              fontSize: bodyLargeTypography.fontSize,
              lineHeight: bodyLargeTypography.lineHeight,
              fontWeight: 600,
              marginBottom: responsive.getSpacing('MD')
            }}
          >
            Adaptive Layout Example (Requirement 8.5)
          </Typography>

          <Grid container spacing={responsive.getSpacing('MD')}>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  padding: responsive.getSpacing('MD'),
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: theme.spacing(1),
                  textAlign: 'center'
                }}
              >
                <Typography variant='body2'>
                  Mobile: Full width
                  <br />
                  Tablet: Half width
                  <br />
                  Desktop: Third width
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  padding: responsive.getSpacing('MD'),
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                  borderRadius: theme.spacing(1),
                  textAlign: 'center'
                }}
              >
                <Typography variant='body2'>
                  Adaptive spacing:
                  <br />
                  {responsive.getSpacing('MD')}px
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Box
                sx={{
                  padding: responsive.getSpacing('MD'),
                  backgroundColor: alpha(theme.palette.success.main, 0.05),
                  borderRadius: theme.spacing(1),
                  textAlign: 'center'
                }}
              >
                <Typography variant='body2'>
                  Layout direction:
                  <br />
                  {quizInterface.stackLayout ? 'Column' : 'Row'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </TouchOptimizedCard>

      {/* Touch Target Examples (Requirement 8.2) */}
      <TouchOptimizedCard>
        <CardContent>
          <Typography
            variant='h6'
            sx={{
              fontSize: bodyLargeTypography.fontSize,
              lineHeight: bodyLargeTypography.lineHeight,
              fontWeight: 600,
              marginBottom: responsive.getSpacing('MD')
            }}
          >
            Touch Target Examples (Requirement 8.2)
          </Typography>

          <Stack
            spacing={responsive.getSpacing('MD')}
            direction={responsive.isMobile ? 'column' : 'row'}
            alignItems={responsive.isMobile ? 'stretch' : 'center'}
          >
            <TouchTargetButton variant='contained' color='primary'>
              Primary Action ({responsive.getTouchTarget()}px)
            </TouchTargetButton>

            <TouchTargetButton variant='outlined' color='secondary'>
              Secondary Action
            </TouchTargetButton>

            <TouchTargetButton variant='text' color='info'>
              Text Action
            </TouchTargetButton>
          </Stack>

          <Box sx={{ mt: responsive.getSpacing('MD') }}>
            <Typography
              variant='caption'
              sx={{
                fontSize: captionTypography.fontSize,
                lineHeight: captionTypography.lineHeight,
                color: theme.palette.text.secondary
              }}
            >
              All buttons maintain minimum {responsive.getMinTouchTarget()}px touch targets on mobile devices. Current
              touch target size: {responsive.getTouchTarget()}px
            </Typography>
          </Box>
        </CardContent>
      </TouchOptimizedCard>

      {/* Performance Information */}
      <TouchOptimizedCard>
        <CardContent>
          <Typography
            variant='h6'
            sx={{
              fontSize: bodyLargeTypography.fontSize,
              lineHeight: bodyLargeTypography.lineHeight,
              fontWeight: 600,
              marginBottom: responsive.getSpacing('MD')
            }}
          >
            Performance Optimizations
          </Typography>

          <Stack spacing={1}>
            <Typography variant='body2'>• Animation duration: {responsive.getAnimationDuration()}ms</Typography>
            <Typography variant='body2'>
              • Hover effects: {responsive.shouldEnableHover() ? 'Enabled' : 'Disabled'}
            </Typography>
            <Typography variant='body2'>
              • Animations: {responsive.shouldEnableAnimations() ? 'Enabled' : 'Disabled'}
            </Typography>
            <Typography variant='body2'>
              • Performance optimization: {responsive.shouldOptimizeForPerformance() ? 'Active' : 'Inactive'}
            </Typography>
            <Typography variant='body2'>• Max particles: {responsive.getMaxParticles()}</Typography>
            <Typography variant='body2'>• Slow connection: {responsive.isSlowConnection ? 'Yes' : 'No'}</Typography>
            <Typography variant='body2'>• Low-end device: {responsive.isLowEndDevice ? 'Yes' : 'No'}</Typography>
          </Stack>
        </CardContent>
      </TouchOptimizedCard>
    </ResponsiveContainer>
  )
}

export default ResponsiveExample
