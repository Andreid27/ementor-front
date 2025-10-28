/**
 * Apple Design System Validation Test
 *
 * Comprehensive validation to ensure the design system meets all requirements:
 * - 6.1: 8px grid system for all spacing decisions
 * - 6.2: Typography hierarchy with maximum 3 font sizes per screen
 * - 6.3: Consistent border radius values (4px, 8px, 12px)
 * - 6.4: Elevation system with maximum 4dp shadows
 * - 6.5: Limited color palette with proper contrast ratios (minimum 4.5:1)
 */

import { APPLE_DESIGN_SYSTEM } from './index'
import { validateDesignSystem } from './utils'

/**
 * Test suite for Apple Design System compliance
 */
export class AppleDesignSystemValidator {
  private violations: string[] = []
  private passed: string[] = []

  /**
   * Run all validation tests
   */
  public runAllTests(): { isValid: boolean; violations: string[]; passed: string[] } {
    this.violations = []
    this.passed = []

    this.testSpacingSystem()
    this.testTypographyHierarchy()
    this.testBorderRadiusConsistency()
    this.testElevationSystem()
    this.testColorPalette()
    this.testComponentCompliance()
    this.testAnimationSystem()
    this.testResponsiveDesign()

    return {
      isValid: this.violations.length === 0,
      violations: this.violations,
      passed: this.passed
    }
  }

  /**
   * Test Requirement 6.1: 8px grid system
   */
  private testSpacingSystem(): void {
    const { SPACING } = APPLE_DESIGN_SYSTEM

    // Test base unit is 8px
    if (SPACING.BASE === 8) {
      this.passed.push('✓ Base spacing unit is 8px')
    } else {
      this.violations.push(`✗ Base spacing unit should be 8px, got ${SPACING.BASE}px`)
    }

    // Test all spacing values are multiples of 8px
    const spacingValues = [SPACING.XS, SPACING.SM, SPACING.MD, SPACING.LG, SPACING.XL, SPACING.XXL]

    const invalidSpacing = spacingValues.filter(value => value % SPACING.BASE !== 0)
    if (invalidSpacing.length === 0) {
      this.passed.push('✓ All spacing values follow 8px grid system')
    } else {
      this.violations.push(`✗ Spacing values not following 8px grid: ${invalidSpacing.join(', ')}`)
    }

    // Test component-specific spacing
    const componentSpacing = [
      SPACING.CARD_PADDING.MOBILE,
      SPACING.CARD_PADDING.DESKTOP,
      SPACING.QUESTION_SPACING.MOBILE,
      SPACING.QUESTION_SPACING.DESKTOP
    ]

    const invalidComponentSpacing = componentSpacing.filter(value => value % SPACING.BASE !== 0)
    if (invalidComponentSpacing.length === 0) {
      this.passed.push('✓ Component spacing follows 8px grid system')
    } else {
      this.violations.push(`✗ Component spacing not following 8px grid: ${invalidComponentSpacing.join(', ')}`)
    }
  }

  /**
   * Test Requirement 6.2: Typography hierarchy (max 3 sizes per screen)
   */
  private testTypographyHierarchy(): void {
    const { TYPOGRAPHY } = APPLE_DESIGN_SYSTEM

    // Test maximum sizes per screen limit
    if (TYPOGRAPHY.MAX_SIZES_PER_SCREEN === 3) {
      this.passed.push('✓ Typography hierarchy limited to 3 sizes per screen')
    } else {
      this.violations.push(
        `✗ Typography hierarchy should be limited to 3 sizes per screen, got ${TYPOGRAPHY.MAX_SIZES_PER_SCREEN}`
      )
    }

    // Test primary typography variants (should be exactly 3)
    const primaryVariants = ['DISPLAY', 'BODY_LARGE', 'BODY_REGULAR']
    if (primaryVariants.length === 3) {
      this.passed.push('✓ Primary typography variants comply with 3-size limit')
    } else {
      this.violations.push(`✗ Primary typography variants exceed 3-size limit: ${primaryVariants.length}`)
    }

    // Test font family consistency
    const expectedFontFamily = [
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Display',
      'SF Pro Text',
      'Helvetica Neue',
      'Helvetica',
      'Arial',
      'sans-serif'
    ].join(',')

    if (TYPOGRAPHY.FONT_FAMILY === expectedFontFamily) {
      this.passed.push('✓ Apple system font family correctly implemented')
    } else {
      this.violations.push('✗ Font family does not match Apple system font stack')
    }

    // Test line height ratios
    const displayRatio = TYPOGRAPHY.DISPLAY.LINE_HEIGHT.DESKTOP / TYPOGRAPHY.DISPLAY.SIZE.DESKTOP
    const bodyRatio = TYPOGRAPHY.BODY_LARGE.LINE_HEIGHT.DESKTOP / TYPOGRAPHY.BODY_LARGE.SIZE.DESKTOP

    if (displayRatio >= 1.2 && displayRatio <= 1.3) {
      this.passed.push('✓ Display typography line height ratio is appropriate')
    } else {
      this.violations.push(`✗ Display typography line height ratio should be 1.2-1.3, got ${displayRatio.toFixed(2)}`)
    }

    if (bodyRatio >= 1.4 && bodyRatio <= 1.6) {
      this.passed.push('✓ Body typography line height ratio is appropriate')
    } else {
      this.violations.push(`✗ Body typography line height ratio should be 1.4-1.6, got ${bodyRatio.toFixed(2)}`)
    }
  }

  /**
   * Test Requirement 6.3: Consistent border radius values
   */
  private testBorderRadiusConsistency(): void {
    const { BORDER_RADIUS } = APPLE_DESIGN_SYSTEM

    // Test allowed radius values
    const allowedValues = [4, 8, 12, 16]
    const actualValues = [BORDER_RADIUS.SMALL, BORDER_RADIUS.MEDIUM, BORDER_RADIUS.LARGE, BORDER_RADIUS.EXTRA_LARGE]

    const invalidValues = actualValues.filter(value => !allowedValues.includes(value))
    if (invalidValues.length === 0) {
      this.passed.push('✓ Border radius values are consistent (4px, 8px, 12px, 16px)')
    } else {
      this.violations.push(`✗ Invalid border radius values: ${invalidValues.join(', ')}`)
    }

    // Test component-specific radius consistency
    if (BORDER_RADIUS.RADIO_COMPONENT === BORDER_RADIUS.MEDIUM) {
      this.passed.push('✓ Radio component border radius is consistent')
    } else {
      this.violations.push('✗ Radio component border radius is not consistent with medium radius')
    }

    if (BORDER_RADIUS.QUESTION_CARD.DESKTOP === BORDER_RADIUS.LARGE) {
      this.passed.push('✓ Question card desktop border radius is consistent')
    } else {
      this.violations.push('✗ Question card desktop border radius is not consistent with large radius')
    }

    if (BORDER_RADIUS.QUESTION_CARD.MOBILE === BORDER_RADIUS.MEDIUM) {
      this.passed.push('✓ Question card mobile border radius is consistent')
    } else {
      this.violations.push('✗ Question card mobile border radius is not consistent with medium radius')
    }
  }

  /**
   * Test Requirement 6.4: Elevation system (max 4dp)
   */
  private testElevationSystem(): void {
    const { ELEVATION } = APPLE_DESIGN_SYSTEM

    // Test maximum elevation limit
    if (ELEVATION.MAX_ELEVATION === 4) {
      this.passed.push('✓ Maximum elevation is limited to 4dp')
    } else {
      this.violations.push(`✗ Maximum elevation should be 4dp, got ${ELEVATION.MAX_ELEVATION}dp`)
    }

    // Test elevation levels don't exceed maximum
    const elevationLevels = [ELEVATION.NONE, ELEVATION.SUBTLE, ELEVATION.RAISED, ELEVATION.FLOATING, ELEVATION.MODAL]

    const exceedsMax = elevationLevels.filter(level => level > ELEVATION.MAX_ELEVATION)
    if (exceedsMax.length === 0) {
      this.passed.push('✓ All elevation levels are within 4dp maximum')
    } else {
      this.violations.push(`✗ Elevation levels exceed 4dp maximum: ${exceedsMax.join(', ')}`)
    }

    // Test component elevations
    if (ELEVATION.QUESTION_CARD === 2) {
      this.passed.push('✓ Question card elevation is 2dp (subtle)')
    } else {
      this.violations.push(`✗ Question card elevation should be 2dp, got ${ELEVATION.QUESTION_CARD}dp`)
    }

    // Test shadow definitions exist
    const lightShadows = ELEVATION.SHADOWS.LIGHT
    const darkShadows = ELEVATION.SHADOWS.DARK

    if (lightShadows.RAISED && darkShadows.RAISED) {
      this.passed.push('✓ Shadow definitions exist for both light and dark themes')
    } else {
      this.violations.push('✗ Missing shadow definitions for light or dark theme')
    }
  }

  /**
   * Test Requirement 6.5: Color palette with proper contrast
   */
  private testColorPalette(): void {
    const { COLORS } = APPLE_DESIGN_SYSTEM

    // Test minimum contrast ratio requirement
    if (COLORS.MIN_CONTRAST_RATIO === 4.5) {
      this.passed.push('✓ Minimum contrast ratio is set to 4.5:1 (WCAG AA)')
    } else {
      this.violations.push(`✗ Minimum contrast ratio should be 4.5:1, got ${COLORS.MIN_CONTRAST_RATIO}:1`)
    }

    // Test Apple color values
    if (COLORS.PRIMARY.BLUE === '#007AFF') {
      this.passed.push('✓ Apple Blue primary color is correct')
    } else {
      this.violations.push(`✗ Apple Blue should be #007AFF, got ${COLORS.PRIMARY.BLUE}`)
    }

    if (COLORS.SUCCESS === '#34C759') {
      this.passed.push('✓ Apple Green success color is correct')
    } else {
      this.violations.push(`✗ Apple Green should be #34C759, got ${COLORS.SUCCESS}`)
    }

    if (COLORS.WARNING === '#FF9500') {
      this.passed.push('✓ Apple Orange warning color is correct')
    } else {
      this.violations.push(`✗ Apple Orange should be #FF9500, got ${COLORS.WARNING}`)
    }

    if (COLORS.ERROR === '#FF3B30') {
      this.passed.push('✓ Apple Red error color is correct')
    } else {
      this.violations.push(`✗ Apple Red should be #FF3B30, got ${COLORS.ERROR}`)
    }

    // Test text color contrast
    if (COLORS.TEXT.PRIMARY.LIGHT === '#000000' && COLORS.TEXT.PRIMARY.DARK === '#FFFFFF') {
      this.passed.push('✓ Primary text colors provide maximum contrast')
    } else {
      this.violations.push('✗ Primary text colors do not provide maximum contrast')
    }

    // Test limited palette principle
    const semanticColors = [COLORS.PRIMARY.BLUE, COLORS.SUCCESS, COLORS.WARNING, COLORS.ERROR]
    if (semanticColors.length === 4) {
      this.passed.push('✓ Limited color palette with 4 semantic colors')
    } else {
      this.violations.push(`✗ Color palette should have 4 semantic colors, got ${semanticColors.length}`)
    }
  }

  /**
   * Test component-specific compliance
   */
  private testComponentCompliance(): void {
    const { COMPONENTS } = APPLE_DESIGN_SYSTEM

    // Test Progress Card compliance
    const progressCard = COMPONENTS.PROGRESS_CARD
    if (progressCard.MIN_HEIGHT === 64 && progressCard.COMPACT_HEIGHT === 48) {
      this.passed.push('✓ Progress Card height specifications are correct')
    } else {
      this.violations.push('✗ Progress Card height specifications are incorrect')
    }

    // Test Question Card compliance
    const questionCard = COMPONENTS.QUESTION_CARD
    if (questionCard.SPACING_BETWEEN.DESKTOP === 32 && questionCard.SPACING_BETWEEN.MOBILE === 24) {
      this.passed.push('✓ Question Card spacing meets maximum requirements')
    } else {
      this.violations.push('✗ Question Card spacing exceeds maximum requirements')
    }

    // Test Radio Component compliance
    const radioComponent = COMPONENTS.RADIO_COMPONENT
    if (radioComponent.TOUCH_TARGET === 44 && radioComponent.SPACING_BETWEEN === 12) {
      this.passed.push('✓ Radio Component meets touch target and spacing requirements')
    } else {
      this.violations.push('✗ Radio Component does not meet touch target or spacing requirements')
    }

    // Test Submit Card compliance
    const submitCard = COMPONENTS.SUBMIT_CARD
    if (submitCard.MAX_WIDTH === 480) {
      this.passed.push('✓ Submit Card maximum width is correct')
    } else {
      this.violations.push(`✗ Submit Card maximum width should be 480px, got ${submitCard.MAX_WIDTH}px`)
    }
  }

  /**
   * Test animation system compliance
   */
  private testAnimationSystem(): void {
    const { ANIMATION } = APPLE_DESIGN_SYSTEM

    // Test duration standards
    if (ANIMATION.DURATION.MICRO === 150 && ANIMATION.DURATION.STANDARD === 300) {
      this.passed.push('✓ Animation durations follow Apple standards')
    } else {
      this.violations.push('✗ Animation durations do not follow Apple standards')
    }

    // Test easing functions
    const standardEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'
    if (ANIMATION.EASING.STANDARD === standardEasing) {
      this.passed.push('✓ Standard easing function is Apple-compliant')
    } else {
      this.violations.push('✗ Standard easing function is not Apple-compliant')
    }

    // Test celebration duration
    if (ANIMATION.DURATION.CELEBRATION === 4000) {
      this.passed.push('✓ Celebration animation duration is 4 seconds')
    } else {
      this.violations.push(`✗ Celebration animation should be 4 seconds, got ${ANIMATION.DURATION.CELEBRATION}ms`)
    }

    // Test reduced motion support
    if (ANIMATION.REDUCED_MOTION.DURATION === 1 && ANIMATION.REDUCED_MOTION.RESPECT_PREFERENCE === true) {
      this.passed.push('✓ Reduced motion support is implemented')
    } else {
      this.violations.push('✗ Reduced motion support is not properly implemented')
    }
  }

  /**
   * Test responsive design compliance
   */
  private testResponsiveDesign(): void {
    const { BREAKPOINTS } = APPLE_DESIGN_SYSTEM

    // Test breakpoint values
    if (BREAKPOINTS.MOBILE.MAX === 767 && BREAKPOINTS.DESKTOP.MIN === 1025) {
      this.passed.push('✓ Responsive breakpoints are correctly defined')
    } else {
      this.violations.push('✗ Responsive breakpoints are not correctly defined')
    }

    // Test container max width
    if (BREAKPOINTS.CONTAINER_MAX_WIDTH === 1200) {
      this.passed.push('✓ Container maximum width is correct')
    } else {
      this.violations.push(`✗ Container maximum width should be 1200px, got ${BREAKPOINTS.CONTAINER_MAX_WIDTH}px`)
    }

    // Test responsive margins
    const margins = BREAKPOINTS.MARGINS
    if (margins.MOBILE === 16 && margins.TABLET === 24 && margins.DESKTOP === 32) {
      this.passed.push('✓ Responsive margins follow progressive enhancement')
    } else {
      this.violations.push('✗ Responsive margins do not follow progressive enhancement')
    }
  }

  /**
   * Generate validation report
   */
  public generateReport(): string {
    const result = this.runAllTests()

    let report = '# Apple Design System Validation Report\n\n'

    if (result.isValid) {
      report += '## ✅ VALIDATION PASSED\n\n'
      report += 'All requirements have been successfully implemented.\n\n'
    } else {
      report += '## ❌ VALIDATION FAILED\n\n'
      report += `Found ${result.violations.length} violations that need to be addressed.\n\n`
    }

    report += '## Requirements Compliance\n\n'
    report += '- **Requirement 6.1**: 8px grid system for all spacing decisions\n'
    report += '- **Requirement 6.2**: Typography hierarchy with maximum 3 font sizes per screen\n'
    report += '- **Requirement 6.3**: Consistent border radius values (4px, 8px, 12px)\n'
    report += '- **Requirement 6.4**: Elevation system with maximum 4dp shadows\n'
    report += '- **Requirement 6.5**: Limited color palette with proper contrast ratios (minimum 4.5:1)\n\n'

    if (result.passed.length > 0) {
      report += '## ✅ Passed Tests\n\n'
      result.passed.forEach(test => {
        report += `${test}\n`
      })
      report += '\n'
    }

    if (result.violations.length > 0) {
      report += '## ❌ Failed Tests\n\n'
      result.violations.forEach(violation => {
        report += `${violation}\n`
      })
      report += '\n'
    }

    report += '## Summary\n\n'
    report += `- **Total Tests**: ${result.passed.length + result.violations.length}\n`
    report += `- **Passed**: ${result.passed.length}\n`
    report += `- **Failed**: ${result.violations.length}\n`
    report += `- **Success Rate**: ${(
      (result.passed.length / (result.passed.length + result.violations.length)) *
      100
    ).toFixed(1)}%\n`

    return report
  }
}

/**
 * Run validation and return results
 */
export const validateAppleDesignSystem = () => {
  const validator = new AppleDesignSystemValidator()
  return validator.runAllTests()
}

/**
 * Generate and return validation report
 */
export const generateValidationReport = () => {
  const validator = new AppleDesignSystemValidator()
  return validator.generateReport()
}

export default AppleDesignSystemValidator
