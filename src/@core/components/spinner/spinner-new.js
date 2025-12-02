import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

/**
 * Professional Immersive Loader - ENHANCED EDITION
 * - Phase 1: Triple 1080° Spin with Elastic Bounce (0.8s)
 * - Phase 2: Cap drops with spring physics (0.9s)
 * - Phase 3: "E" breathes with pulsing glow + 3D depth
 * - Phase 4: Ambient floating particles and dynamic progress
 */

const ImmersiveLoader = ({ sx }) => {
  const theme = useTheme()

  const colors = {
    greenLight: '#28C76F',
    greenDark: '#42A572',
    black: '#231F20',
    gray: '#383536'
  }

  // --- ENHANCED Animation Variants ---

  // 1. Triple 1080° Spin with Elastic Bounce
  const spinVariant = {
    hidden: {
      rotate: -1080,
      scale: 0.3,
      opacity: 0,
      y: -100
    },
    visible: {
      rotate: [0, 360, 0], // Extra rotation for drama
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        rotate: {
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1] // Elastic easing
        },
        scale: {
          duration: 0.7,
          ease: [0.34, 1.56, 0.64, 1]
        },
        opacity: { duration: 0.4 },
        y: {
          duration: 0.7,
          ease: [0.34, 1.56, 0.64, 1]
        }
      }
    }
  }

  // 2. Enhanced Draw with Shimmer
  const eDrawVariant = {
    hidden: { pathLength: 0, opacity: 0, fillOpacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      fillOpacity: 1,
      transition: {
        pathLength: { duration: 0.6, ease: 'easeInOut' },
        fillOpacity: { duration: 0.3, delay: 0.4 },
        opacity: { duration: 0.3 }
      }
    }
  }

  // 3. Cap Drop with Bounce
  const capDropVariant = {
    hidden: { y: -80, opacity: 0, scale: 0.7, rotate: -15 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.7,
        type: 'spring',
        stiffness: 200,
        damping: 15,
        mass: 0.8
      }
    }
  }

  // 4. Enhanced Breathing Float with 3D Perspective
  const breathingFloat = (delay = 0, yDistance = -25, rotateDeg = 3, isGlowing = false) => ({
    animate: {
      y: [0, yDistance, 0],
      rotate: [0, rotateDeg, -rotateDeg, 0],
      scale: [1, 1.08, 1.03, 1],
      filter: isGlowing
        ? [
            'drop-shadow(0px 0px 0px rgba(40, 199, 111, 0))',
            `drop-shadow(0px 0px 35px ${colors.greenLight})`,
            `drop-shadow(0px 0px 45px ${colors.greenLight})`,
            `drop-shadow(0px 0px 35px ${colors.greenLight})`,
            'drop-shadow(0px 0px 0px rgba(40, 199, 111, 0))'
          ]
        : [
            'drop-shadow(0px 5px 15px rgba(0,0,0,0.1))',
            'drop-shadow(0px 15px 25px rgba(0,0,0,0.15))',
            'drop-shadow(0px 10px 20px rgba(0,0,0,0.12))',
            'drop-shadow(0px 5px 15px rgba(0,0,0,0.1))'
          ],
      transition: {
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
        delay: delay + 1.2
      }
    }
  })

  // 5. Floating Particles
  const particleVariants = index => ({
    animate: {
      y: [0, -30 - index * 10, -60 - index * 15, -30 - index * 10, 0],
      x: [0, Math.sin(index) * 20, Math.cos(index) * 15, -Math.sin(index) * 10, 0],
      opacity: [0, 0.4, 0.7, 0.4, 0],
      scale: [0, 1, 1.2, 1, 0],
      transition: {
        duration: 4 + index * 0.5,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: 1.5 + index * 0.3
      }
    }
  })

  // 6. Radial Pulse Background
  const radialPulse = {
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.1, 0.3, 0.1],
      transition: {
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: 1
      }
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'background.default',
        overflow: 'hidden',
        position: 'relative',
        ...sx
      }}
    >
      {/* --- AMBIENT BACKGROUND EFFECTS --- */}
      {/* Radial Gradient Pulse */}
      <Box
        component={motion.div}
        sx={{
          position: 'absolute',
          width: { xs: 400, md: 600 },
          height: { xs: 400, md: 600 },
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(40, 199, 111, 0.08) 0%, transparent 70%)`,
          zIndex: 1
        }}
        variants={radialPulse}
        animate='animate'
      />

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          component={motion.div}
          sx={{
            position: 'absolute',
            width: { xs: 4, md: 6 },
            height: { xs: 4, md: 6 },
            borderRadius: '50%',
            backgroundColor: colors.greenLight,
            top: '50%',
            left: `${30 + i * 10}%`,
            zIndex: 2
          }}
          variants={particleVariants(i)}
          animate='animate'
        />
      ))}

      {/* --- MAIN LOGO CONTAINER --- */}
      <Box
        component={motion.div}
        sx={{
          position: 'relative',
          zIndex: 10,
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 }
        }}
        initial='hidden'
        animate='visible'
      >
        <motion.svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 2500 2500'
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* GROUP 1: The "E" (Spins, Draws, then GLOWS) */}
          <motion.g variants={spinVariant}>
            {/* Pass true to enable the GLOW effect on the E */}
            <motion.g variants={breathingFloat(0, 20, 3, true)} animate='animate'>
              {/* Main Green Body */}
              <motion.path
                d='M956.3,1246.05c17.58-189.87,190.34-264.88,354.74-249.65c134.96,12.5,241.83,101.12,233.25,193.7c-15.62,168.69-404.32,63.46-411.87,145.06c-3.41,36.87,87.36,72.18,148.7,77.86c201.21,18.63,210.29-79.44,227.46-77.85c18.4,1.7,18.31,42.84,17.73,49.12c-9.23,99.64-134.76,145.78-281.99,132.15C1024.71,1496.11,944.67,1371.58,956.3,1246.05z M1129.12,1183.71c-0.8,8.63,4.54,17.83,20.48,19.3c14.72,1.36,240.92-9.34,244.62-49.36c3.56-38.44-50.91-64.86-97.53-69.17C1197.32,1075.29,1133.34,1138.21,1129.12,1183.71z'
                fill={colors.greenLight}
                stroke={colors.greenLight}
                strokeWidth='2'
                variants={eDrawVariant}
              />
              {/* Dark Green Accents */}
              <motion.path
                d='M1191.64,1104.63c-54.95,17.69-88.36,58.99-91.36,91.44c-0.8,8.63,4.54,17.83,20.48,19.3c13.05,1.21,192.2-7.07,235.36-36.82c-65.99,19.73-195.49,25.48-206.51,24.45c-15.95-1.48-21.28-10.68-20.48-19.3C1131.56,1157.41,1153.97,1125.28,1191.64,1104.63z'
                fill={colors.greenDark}
                variants={eDrawVariant}
              />
              <motion.path
                d='M1141.52,1318.65c-22.35,5.24-36.56,13.92-37.94,28.87c-3.41,36.87,87.36,72.18,148.7,77.86c84.62,7.84,135.25-4.97,166.8-22.32c-31.43,10.26-75.41,15.75-137.96,9.96c-61.34-5.68-152.12-40.99-148.7-77.86C1133.04,1328.49,1136.22,1323.07,1141.52,1318.65z'
                fill={colors.greenDark}
                variants={eDrawVariant}
              />
              <motion.path
                d='M1508.59,1335.18c-5.12-0.47-9.53,7.92-18.52,19.43c8,12.44,7.84,37.28,7.4,42.05c-4.23,45.69-32.93,80.12-76.95,102.71c60.11-21.34,100.7-60.04,105.8-115.07C1526.89,1378.02,1526.99,1336.88,1508.59,1335.18z'
                fill={colors.greenDark}
                variants={eDrawVariant}
              />
              <motion.path
                d='M1311.04,996.4c-72.05-6.67-145.69,3.99-207.19,34.05c55.01-20.53,117.25-27.34,178.34-21.68c134.96,12.5,241.83,101.12,233.25,193.7c-3.22,34.82-22.35,57.96-50.74,73.49c43.86-14.67,75.36-40.25,79.58-85.85C1552.87,1097.52,1446,1008.9,1311.04,996.4z'
                fill={colors.greenDark}
                variants={eDrawVariant}
              />
            </motion.g>
          </motion.g>

          {/* GROUP 2: The Cap and Exclamation (Drops in AFTER spin) */}
          <motion.g variants={capDropVariant}>
            <motion.g
              variants={breathingFloat(0.3, -35, -4, false)}
              animate='animate'
              style={{ transformOrigin: 'center' }}
            >
              {/* Exclamation Point */}
              <motion.path
                d='M945.43,944.06c0,7.2-5.87,13.02-13.01,13.02c-7.15,0-13.03-5.82-13.03-13.02c0-7.15,5.87-12.97,13.03-12.97C939.56,931.09,945.43,936.91,945.43,944.06z'
                fill={colors.greenLight}
              />
              <motion.polygon points='947.54,1102.53 917.23,1102.53 932.42,970.67' fill={colors.greenLight} />

              {/* The Cap Structure */}
              <motion.g>
                <motion.path
                  d='M1654.04,901.15l-143.91,46.36c-6.59-20.22-32.52-34.58-81.1-45.12c-43.68-9.47-101.41-14.66-162.59-14.66c-61.18,0-118.91,5.19-162.59,14.66c-48.98,10.65-74.97,25.16-81.24,45.64l-143.7-45.54l386.56-124.46L1654.04,901.15z'
                  fill={colors.black}
                />
                <motion.path
                  d='M1487.23,947.87v120.14c-23.47-25.06-124.21-39.72-220.79-39.72c-96.58,0-197.32,14.66-220.78,39.72V947.87c0-22.13,88.7-45.84,220.78-45.84S1487.23,925.74,1487.23,947.87z'
                  fill={colors.black}
                />
                <motion.path
                  d='M1263.57,778.63L878.91,902.49l143.7,45.54c6.28-20.48,32.26-34.99,81.24-45.64c43-9.32,99.6-14.49,159.71-14.65V778.63z'
                  fill={colors.gray}
                />
                <motion.path
                  d='M1263.57,902.04c-130.47,0.34-217.9,23.87-217.9,45.83v120.14c23.23-24.81,122.21-39.41,217.9-39.71V902.04z'
                  fill={colors.gray}
                />
              </motion.g>
            </motion.g>
          </motion.g>
        </motion.svg>
      </Box>

      {/* --- ENHANCED UI LAYER: Text & Dynamic Progress --- */}
      <Box
        component={motion.div}
        sx={{
          mt: -10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
      >
        <Typography
          component={motion.h2}
          animate={{
            opacity: [0.7, 1, 0.7],
            letterSpacing: ['0.1em', '0.15em', '0.1em']
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: 1.5
          }}
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            letterSpacing: '0.1em',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}
        >
          Loading
        </Typography>

        {/* Enhanced Progress Bar with Gradient */}

        {/* Subtle loading dots */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2
          }}
        >
          {[0, 1, 2].map(i => (
            <Box
              key={i}
              component={motion.div}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: colors.greenLight
              }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                ease: 'easeInOut',
                repeat: Infinity,
                delay: 1.2 + i * 0.2
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default ImmersiveLoader
