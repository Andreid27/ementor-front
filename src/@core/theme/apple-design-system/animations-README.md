# Apple-Style Animation System

This animation system implements Apple's design principles for the quiz interface, providing consistent timing, easing functions, and reduced motion support.

## Requirements Addressed

- **7.1**: Consistent animation durations (150ms micro-interactions, 300ms transitions)
- **7.2**: Apple-style cubic-bezier easing functions
- **7.4**: Reduced motion support system
- **7.5**: Ensure all animations serve functional purposes

## Quick Start

### 1. Import the Animation System

```typescript
import { useAppleAnimations } from '@core/theme/apple-design-system'
```

### 2. Use in Your Component

```typescript
const MyComponent = () => {
  const { createTransition, getMicroDuration, getAnimationClasses, prefersReducedMotion } = useAppleAnimations()

  const style = {
    transition: createTransition(['opacity', 'transform'])
  }

  return <div style={style}>Animated content</div>
}
```

## Animation Durations (Requirement 7.1)

### Standard Durations

- **Micro-interactions**: 150ms (hover states, focus changes)
- **Standard transitions**: 300ms (state changes, layout shifts)
- **Complex animations**: 500ms (page transitions)

### Component-Specific Durations

- **Radio selection**: 200ms (Requirement 3.2)
- **Touch feedback**: 100ms (mobile responsiveness)
- **Celebration sequence**: 4000ms total (Requirement 5.4)

### Usage

```typescript
const { getMicroDuration, getStandardDuration } = useAppleAnimations()

// Get duration with automatic reduced motion support
const duration = getMicroDuration() // 150ms or 1ms if reduced motion
```

## Easing Functions (Requirement 7.2)

### Apple-Style Easing Curves

```css
/* Standard easing for most transitions */
--apple-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

/* Entrance animations */
--apple-ease-decelerate: cubic-bezier(0, 0, 0.2, 1);

/* Exit animations */
--apple-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);

/* Quick interactions */
--apple-ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);

/* Spring-like animations */
--apple-ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Usage in React

```typescript
const { easing, createTransition } = useAppleAnimations()

const style = {
  transition: createTransition('transform', 300, easing.SPRING)
}
```

## Reduced Motion Support (Requirement 7.4)

The system automatically respects user preferences for reduced motion:

```typescript
const { prefersReducedMotion, getDuration } = useAppleAnimations()

// Automatically returns 1ms if user prefers reduced motion
const safeDuration = getDuration(300)

if (prefersReducedMotion) {
  // Skip complex animations
  return <StaticComponent />
}
```

### CSS Implementation

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Functional Animation Principles (Requirement 7.5)

All animations must serve a functional purpose:

### ✅ Good Examples

- **Feedback**: Visual confirmation of user interactions
- **Transition**: Smooth changes between states
- **Loading**: Progress indication for async operations
- **Celebration**: Positive reinforcement for achievements
- **Navigation**: Spatial awareness during navigation

### ❌ Avoid

- Purely decorative animations
- Animations that don't enhance usability
- Excessive or distracting motion

## Component-Specific Animations

### Progress Card (Requirements 1.2, 1.5)

```typescript
import { AnimatedProgressCard } from '@core/theme/apple-design-system/animation-examples'

;<AnimatedProgressCard title='Test Title' progress={75} timeRemaining={10} isCompact={isScrolled} />
```

### Question Card (Requirement 2.3)

```typescript
import { AnimatedQuestionCard } from '@core/theme/apple-design-system/animation-examples'

;<AnimatedQuestionCard questionNumber={1} totalQuestions={10} questionText='Care este capitala Franței?'>
  {/* Answer options */}
</AnimatedQuestionCard>
```

### Radio Component (Requirements 3.2, 3.5)

```typescript
import { AnimatedRadioOption } from '@core/theme/apple-design-system/animation-examples'

;<AnimatedRadioOption
  id='option-a'
  value='A'
  label='A. Paris'
  isSelected={selectedValue === 'A'}
  onChange={handleChange}
/>
```

### Submit Card (Requirement 4.4)

```typescript
import { AnimatedSubmitCard } from '@core/theme/apple-design-system/animation-examples'

;<AnimatedSubmitCard
  answeredQuestions={8}
  totalQuestions={10}
  isLoading={isSubmitting}
  onSubmit={handleSubmit}
  onReview={handleReview}
/>
```

### Celebration Animation (Requirements 5.1-5.5)

```typescript
import { AnimatedCelebration } from '@core/theme/apple-design-system/animation-examples'

;<AnimatedCelebration score={8} totalQuestions={10} isVisible={showCelebration} onContinue={handleContinue} />
```

## CSS Utility Classes

### Basic Transitions

```css
.apple-transition          /* Standard 300ms transition */
/* Standard 300ms transition */
.apple-transition-micro    /* Micro 150ms transition */
.apple-transition-complex; /* Complex 500ms transition */
```

### Property-Specific Transitions

```css
.apple-transition-transform  /* Transform only */
/* Transform only */
.apple-transition-opacity    /* Opacity only */
.apple-transition-colors     /* Color properties */
.apple-transition-shadow; /* Box shadow */
```

### Component Classes

```css
.apple-progress-card    /* Progress card animations */
/* Progress card animations */
.apple-question-card    /* Question card animations */
.apple-radio-option     /* Radio option animations */
.apple-submit-card; /* Submit card animations */
```

### Animation Classes

```css
.apple-enter           /* Entrance animation */
/* Entrance animation */
.apple-exit            /* Exit animation */
.apple-bounce          /* Bounce effect */
.apple-pulse           /* Pulse effect */
.apple-spinner; /* Loading spinner */
```

## Performance Optimization

### GPU Acceleration

```typescript
const { optimizeForPerformance, cleanupPerformanceOptimizations } = useAppleAnimations()

// Before animation
optimizeForPerformance(element)

// After animation
cleanupPerformanceOptimizations(element)
```

### Animation Lifecycle Hook

```typescript
import { useAnimationLifecycle } from '@core/theme/apple-design-system'

const MyComponent = () => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Automatically optimizes performance during animations
  useAnimationLifecycle(elementRef, isAnimating)

  return <div ref={elementRef}>Content</div>
}
```

## Responsive Animations

The system automatically adjusts animation durations for different screen sizes:

- **Mobile**: 20% faster (better responsiveness)
- **Tablet**: 10% faster
- **Desktop**: Full duration

### Touch Feedback

```typescript
import { useTouchFeedback } from '@core/theme/apple-design-system'

const TouchableComponent = () => {
  const elementRef = useRef<HTMLDivElement>(null)

  // Automatically adds touch feedback on mobile
  useTouchFeedback(elementRef)

  return <div ref={elementRef}>Touchable content</div>
}
```

## Custom Properties (CSS Variables)

```css
:root {
  /* Durations */
  --apple-duration-micro: 150ms;
  --apple-duration-standard: 300ms;
  --apple-duration-complex: 500ms;

  /* Easing */
  --apple-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --apple-ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --apple-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);

  /* Scales */
  --apple-scale-press: 0.98;
  --apple-scale-hover: 1.02;
}
```

## Best Practices

### 1. Use Semantic Animation Names

```typescript
// ✅ Good
const fadeInTransition = createTransition('opacity', getMicroDuration())

// ❌ Avoid
const transition1 = createTransition('opacity', 150)
```

### 2. Respect Reduced Motion

```typescript
// ✅ Good
if (!prefersReducedMotion) {
  // Complex animation
} else {
  // Simple state change
}

// ❌ Avoid
// Always animating regardless of user preference
```

### 3. Optimize Performance

```typescript
// ✅ Good - Use transform and opacity
const style = {
  transform: 'translateY(-2px)',
  opacity: isVisible ? 1 : 0
}

// ❌ Avoid - Animating layout properties
const style = {
  top: isVisible ? '0px' : '20px',
  height: isVisible ? '100px' : '0px'
}
```

### 4. Provide Functional Purpose

```typescript
// ✅ Good - Provides feedback
const handleClick = () => {
  // Visual feedback for user action
  setIsPressed(true)
  setTimeout(() => setIsPressed(false), getMicroDuration())
}

// ❌ Avoid - Purely decorative
const handleClick = () => {
  // Random animation with no purpose
  setRandomAnimation(true)
}
```

## Integration with Existing Components

### Updating Existing Components

1. Import the animation hook:

```typescript
import { useAppleAnimations } from '@core/theme/apple-design-system'
```

2. Replace hardcoded values:

```typescript
// Before
const style = { transition: 'all 0.3s ease' }

// After
const { createTransition } = useAppleAnimations()
const style = { transition: createTransition('all') }
```

3. Add reduced motion support:

```typescript
const { prefersReducedMotion } = useAppleAnimations()

if (prefersReducedMotion) {
  // Skip animation
  return <StaticComponent />
}
```

## Testing Animations

### Reduced Motion Testing

```typescript
// Mock reduced motion preference
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})
```

### Animation Duration Testing

```typescript
import { APPLE_ANIMATION_DURATIONS } from '@core/theme/apple-design-system'

test('uses correct animation duration', () => {
  expect(APPLE_ANIMATION_DURATIONS.MICRO).toBe(150)
  expect(APPLE_ANIMATION_DURATIONS.STANDARD).toBe(300)
})
```

## Troubleshooting

### Common Issues

1. **Animations not working**: Ensure CSS is imported
2. **Performance issues**: Use `useAnimationLifecycle` hook
3. **Reduced motion not respected**: Check media query support
4. **Inconsistent timing**: Use the provided duration constants

### Debug Mode

```typescript
const { prefersReducedMotion, getDuration } = useAppleAnimations()

console.log('Reduced motion:', prefersReducedMotion)
console.log('Actual duration:', getDuration(300))
```

## Migration Guide

### From Custom Animations

```typescript
// Before
const style = {
  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
}

// After
const { createTransition, easing } = useAppleAnimations()
const style = {
  transition: createTransition('transform', 200, easing.STANDARD)
}
```

### From CSS-only Animations

```css
/* Before */
.my-component {
  transition: all 0.3s ease;
}

/* After */
.my-component {
  transition: var(--apple-transition-standard);
}
```

This animation system ensures consistent, accessible, and performant animations throughout the quiz interface while following Apple's design principles.
