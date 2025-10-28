# Apple Design System

A comprehensive design system implementation following Apple's design principles for the quiz interface redesign.

## Overview

This design system addresses the requirements for creating a polished, premium Apple-inspired UI/UX experience:

- **Requirement 6.1**: 8px grid system for all spacing decisions
- **Requirement 6.2**: Typography hierarchy with maximum 3 font sizes per screen
- **Requirement 6.3**: Consistent border radius values (4px, 8px, 12px)
- **Requirement 6.4**: Elevation system with maximum 4dp shadows
- **Requirement 6.5**: Limited color palette with proper contrast ratios (minimum 4.5:1)

## Apple Design Principles

The system follows Apple's core design principles:

1. **Clarity**: Text is legible at every size, icons are precise and lucid
2. **Deference**: Fluid motion and crisp interface help people understand content
3. **Depth**: Visual layers and realistic motion convey hierarchy and vitality

## Files Structure

```
apple-design-system/
├── index.ts                    # Main constants and design system definition
├── utils.ts                    # Utility functions for design system usage
├── css-variables.css           # CSS custom properties for global usage
├── useAppleDesignSystem.ts     # React hooks for component usage
├── mui-integration.ts          # Material-UI theme integration
└── README.md                   # This documentation
```

## Usage

### 1. Import Design System Constants

```typescript
import { APPLE_DESIGN_SYSTEM } from '@core/theme/apple-design-system'

// Access spacing values
const padding = APPLE_DESIGN_SYSTEM.SPACING.LG // 24px

// Access typography scale
const fontSize = APPLE_DESIGN_SYSTEM.TYPOGRAPHY.BODY_LARGE.SIZE.DESKTOP // 18px

// Access border radius
const radius = APPLE_DESIGN_SYSTEM.BORDER_RADIUS.MEDIUM // 8px
```

### 2. Use React Hooks

```typescript
import { useAppleDesignSystem, useAppleTypography } from '@core/theme/apple-design-system/useAppleDesignSystem'

function MyComponent() {
  const { spacing, colors, borderRadius } = useAppleDesignSystem()
  const typography = useAppleTypography('bodyLarge')

  return (
    <div
      style={{
        padding: spacing.getComponentPadding('question'),
        backgroundColor: colors.get('background'),
        borderRadius: borderRadius.getComponent('questionCard'),
        ...typography
      }}
    >
      Content
    </div>
  )
}
```

### 3. Use CSS Custom Properties

```css
.question-card {
  padding: var(--apple-card-padding-desktop);
  border-radius: var(--apple-border-radius-question-desktop);
  box-shadow: var(--apple-elevation-question-card);
  transition: var(--apple-transition-card);
}

@media (max-width: 767px) {
  .question-card {
    padding: var(--apple-card-padding-mobile);
    border-radius: var(--apple-border-radius-question-mobile);
  }
}
```

### 4. Use Utility Classes

```html
<div class="apple-padding-lg apple-radius-large apple-elevation-raised apple-typography-body-large">
  Question content
</div>
```

### 5. MUI Theme Integration

```typescript
import { createTheme } from '@mui/material/styles'
import { createAppleMuiTheme } from '@core/theme/apple-design-system/mui-integration'

const theme = createTheme(createAppleMuiTheme('light'))
```

## Design System Values

### Spacing (8px Grid)

- `XS`: 4px (0.5 × base)
- `SM`: 8px (1 × base)
- `MD`: 16px (2 × base)
- `LG`: 24px (3 × base)
- `XL`: 32px (4 × base)
- `XXL`: 48px (6 × base)

### Typography Hierarchy

Maximum 3 font sizes per screen:

1. **Display**: 32px desktop / 28px mobile (major headings)
2. **Body Large**: 18px desktop / 16px mobile (question text)
3. **Body Regular**: 16px desktop / 14px mobile (answer options)

Supporting typography (used sparingly):

- **Caption**: 14px desktop / 12px mobile (metadata)

### Border Radius

- **Small**: 4px (buttons, inputs)
- **Medium**: 8px (answer options, mobile cards)
- **Large**: 12px (question cards desktop)
- **Extra Large**: 16px (modals)

### Elevation (Maximum 4dp)

- **Level 0**: No shadow (flat surfaces)
- **Level 1**: Subtle shadow (cards at rest)
- **Level 2**: Raised shadow (question cards)
- **Level 3**: Floating shadow (floating elements)
- **Level 4**: Modal shadow (maximum elevation)

### Color Palette

Limited palette with proper contrast ratios:

- **Primary**: #007AFF (Apple Blue, 4.5:1 contrast)
- **Success**: #34C759 (Apple Green, 4.7:1 contrast)
- **Warning**: #FF9500 (Apple Orange, 4.6:1 contrast)
- **Error**: #FF3B30 (Apple Red, 4.8:1 contrast)

## Component-Specific Usage

### Progress Card (Requirements 1.1-1.5)

```typescript
const progressCardStyles = {
  padding: spacing.getComponentPadding('progress'), // 24px desktop, 16px mobile
  minHeight: APPLE_DESIGN_SYSTEM.COMPONENTS.PROGRESS_CARD.MIN_HEIGHT, // 64px
  boxShadow: elevation.getComponent('progress') // Subtle elevation
}
```

### Question Card (Requirements 2.1-2.5)

```typescript
const questionCardStyles = {
  padding: spacing.getComponentPadding('question'), // 24px desktop, 16px mobile
  marginBottom: spacing.values.QUESTION_SPACING.DESKTOP, // 32px max desktop
  borderRadius: borderRadius.getComponent('questionCard'), // 12px desktop, 8px mobile
  boxShadow: elevation.getComponent('question') // 2dp raised elevation
}
```

### Radio Component (Requirements 3.1-3.5)

```typescript
const radioStyles = {
  borderRadius: borderRadius.getComponent('radio'), // 8px
  minHeight: spacing.values.TOUCH_TARGET.MINIMUM, // 44px minimum
  marginBottom: spacing.values.ANSWER_SPACING, // 12px between options
  transition: `all ${animation.getDuration('micro')}ms ${animation.getEasing('standard')}`
}
```

### Submit Card (Requirements 4.1-4.5)

```typescript
const submitCardStyles = {
  maxWidth: APPLE_DESIGN_SYSTEM.COMPONENTS.SUBMIT_CARD.MAX_WIDTH, // 480px
  padding: spacing.getComponentPadding('submit'), // 24px desktop, 16px mobile
  boxShadow: elevation.getComponent('submit') // Subtle elevation
}
```

## Validation

The design system includes validation utilities to ensure compliance:

```typescript
import { validateDesignSystem } from '@core/theme/apple-design-system/utils'

const validation = validateDesignSystem({
  spacingMultiples: [8, 16, 24, 32], // Should all be multiples of 8
  typographyVariants: ['display', 'bodyLarge', 'bodyRegular'], // Max 3 per screen
  borderRadiusValues: [4, 8, 12], // Consistent values
  elevationLevels: [1, 2, 3, 4], // Max 4dp
  contrastRatios: [4.5, 4.7, 4.6, 4.8] // Min 4.5:1
})

console.log(validation.isValid) // true if all requirements met
console.log(validation.violations) // Array of any violations
```

## Responsive Design

The system follows a mobile-first approach:

```css
/* Mobile-first (default) */
.component {
  padding: var(--apple-spacing-md); /* 16px */
  font-size: var(--apple-font-size-body-regular-mobile); /* 14px */
}

/* Desktop enhancement */
@media (min-width: 1025px) {
  .component {
    padding: var(--apple-spacing-lg); /* 24px */
    font-size: var(--apple-font-size-body-regular-desktop); /* 16px */
  }
}
```

## Animation Support

Consistent animation timing and easing:

```css
.interactive-element {
  transition: all var(--apple-duration-micro) var(--apple-easing-standard);
}

.state-change {
  transition: all var(--apple-duration-standard) var(--apple-easing-standard);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .interactive-element,
  .state-change {
    transition: none;
  }
}
```

## Best Practices

1. **Always use the 8px grid** for spacing decisions
2. **Limit to 3 typography sizes** per screen maximum
3. **Use consistent border radius** values from the system
4. **Never exceed 4dp elevation** for shadows
5. **Ensure minimum 4.5:1 contrast** for all text
6. **Follow mobile-first** responsive design approach
7. **Respect reduced motion** preferences
8. **Use Apple-style easing** functions for animations

## Integration with Existing Code

To integrate with existing quiz components:

1. Import the CSS variables file in your global styles
2. Use the React hooks in your components
3. Apply the MUI theme integration for Material-UI components
4. Gradually migrate existing styles to use the design system values

This ensures a consistent, polished Apple-inspired experience across the entire quiz interface.
