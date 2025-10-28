/**
 * Apple Animation System Usage Examples
 *
 * This file demonstrates how to use the Apple-style animation system
 * in React components for the quiz interface.
 *
 * Requirements addressed:
 * - 7.1: Consistent animation durations (150ms micro-interactions, 300ms transitions)
 * - 7.2: Apple-style cubic-bezier easing functions
 * - 7.4: Reduced motion support system
 * - 7.5: Ensure all animations serve functional purposes
 */

import React, { useState, useRef } from 'react'
import {
  useAppleAnimations,
  useAnimationLifecycle,
  useComponentAnimationStyles,
  useTouchFeedback
} from './useAppleAnimations'

// ============================================================================
// PROGRESS CARD ANIMATION EXAMPLE (Requirements 1.2, 1.5)
// ============================================================================

export const AnimatedProgressCard: React.FC<{
  title: string
  progress: number
  timeRemaining: number
  isCompact?: boolean
}> = ({ title, progress, timeRemaining, isCompact = false }) => {
  const { getAnimationClasses, createTransition } = useAppleAnimations()
  const progressRef = useRef<HTMLDivElement>(null)

  // Use animation lifecycle for performance optimization
  useAnimationLifecycle(progressRef, isCompact)

  const progressCardClasses = getAnimationClasses('PROGRESS_CARD').join(' ')

  const progressCardStyle: React.CSSProperties = {
    transition: createTransition(['height', 'backdrop-filter', 'background-color']),
    height: isCompact ? '48px' : '64px',
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(242, 242, 247, 0.8)'
  }

  const progressBarStyle: React.CSSProperties = {
    transition: createTransition(['width', 'background-color']),
    width: `${progress}%`,
    backgroundColor: '#007AFF'
  }

  return (
    <div
      ref={progressRef}
      className={`quiz-progress-card ${progressCardClasses} ${isCompact ? 'compact' : ''}`}
      style={progressCardStyle}
    >
      <div className='progress-content'>
        <h2 className='apple-text-body-large'>{title}</h2>
        <div className='progress-bar-container'>
          <div className='apple-progress-bar' style={progressBarStyle} />
        </div>
        <p className='apple-text-caption'>
          Progres: {progress}% • Timp rămas: {timeRemaining} minute
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// QUESTION CARD ANIMATION EXAMPLE (Requirement 2.3)
// ============================================================================

export const AnimatedQuestionCard: React.FC<{
  questionNumber: number
  totalQuestions: number
  questionText: string
  children: React.ReactNode
}> = ({ questionNumber, totalQuestions, questionText, children }) => {
  const [isFocused, setIsFocused] = useState(false)
  const { getAnimationClasses } = useAppleAnimations()
  const questionRef = useRef<HTMLDivElement>(null)

  // Use animation lifecycle for performance optimization
  useAnimationLifecycle(questionRef, isFocused)

  const questionCardClasses = getAnimationClasses('QUESTION_CARD').join(' ')

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div
      ref={questionRef}
      className={`quiz-question-card apple-question-card ${questionCardClasses}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
    >
      <div className='quiz-question-number apple-text-caption'>
        Întrebarea {questionNumber} din {totalQuestions}
      </div>
      <div className='quiz-question-text apple-text-body-large'>{questionText}</div>
      <div className='quiz-answer-options'>{children}</div>
    </div>
  )
}

// ============================================================================
// RADIO COMPONENT ANIMATION EXAMPLE (Requirements 3.2, 3.5)
// ============================================================================

export const AnimatedRadioOption: React.FC<{
  id: string
  value: string
  label: string
  isSelected: boolean
  isDisabled?: boolean
  onChange: (value: string) => void
}> = ({ id, value, label, isSelected, isDisabled = false, onChange }) => {
  const { getAnimationClasses, createTransition } = useAppleAnimations()
  const optionRef = useRef<HTMLDivElement>(null)

  // Add touch feedback for mobile devices
  useTouchFeedback(optionRef)

  const radioClasses = getAnimationClasses('RADIO_COMPONENT').join(' ')

  const optionStyle: React.CSSProperties = {
    transition: createTransition(['border-color', 'background-color', 'transform'], 200),
    borderColor: isSelected ? '#007AFF' : '#E5E5EA',
    backgroundColor: isSelected ? '#E3F2FD' : '#FFFFFF',
    opacity: isDisabled ? 0.6 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer'
  }

  const handleClick = () => {
    if (!isDisabled) {
      onChange(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
      e.preventDefault()
      onChange(value)
    }
  }

  return (
    <div
      ref={optionRef}
      className={`quiz-answer-option apple-radio-option ${radioClasses} ${isSelected ? 'selected' : ''} ${
        isDisabled ? 'disabled' : ''
      }`}
      style={optionStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled ? -1 : 0}
      role='radio'
      aria-checked={isSelected}
      aria-disabled={isDisabled}
    >
      <input
        type='radio'
        id={id}
        name='quiz-answer'
        value={value}
        checked={isSelected}
        disabled={isDisabled}
        onChange={() => onChange(value)}
        style={{ marginRight: '12px' }}
      />
      <label htmlFor={id} className='apple-text-body-regular'>
        {label}
      </label>
    </div>
  )
}

// ============================================================================
// SUBMIT CARD ANIMATION EXAMPLE (Requirement 4.4)
// ============================================================================

export const AnimatedSubmitCard: React.FC<{
  answeredQuestions: number
  totalQuestions: number
  isLoading: boolean
  onSubmit: () => void
  onReview: () => void
}> = ({ answeredQuestions, totalQuestions, isLoading, onSubmit, onReview }) => {
  const { getAnimationClasses, createTransition } = useAppleAnimations()
  const submitRef = useRef<HTMLDivElement>(null)

  // Use animation lifecycle for performance optimization
  useAnimationLifecycle(submitRef, isLoading)

  const submitCardClasses = getAnimationClasses('SUBMIT_CARD').join(' ')

  const buttonStyle: React.CSSProperties = {
    transition: createTransition(['background-color', 'transform', 'opacity']),
    opacity: isLoading ? 0.7 : 1,
    transform: isLoading ? 'scale(0.98)' : 'scale(1)'
  }

  return (
    <div ref={submitRef} className={`quiz-submit-card apple-submit-card ${submitCardClasses}`}>
      <h3 className='apple-text-body-large'>Ești gata să trimiți?</h3>
      <p className='apple-text-body-regular apple-mb-lg'>
        Ai răspuns la {answeredQuestions} din {totalQuestions} întrebări
      </p>
      {answeredQuestions < totalQuestions && (
        <p className='apple-text-caption apple-mb-lg'>Completează întrebările rămase sau trimite testul</p>
      )}

      <div className='button-group' style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          className='quiz-submit-button apple-submit-button'
          style={buttonStyle}
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Se trimite...' : 'Trimite Testul'}
        </button>
        <button
          className='quiz-submit-button apple-submit-button'
          style={{
            ...buttonStyle,
            backgroundColor: '#8E8E93',
            color: 'white'
          }}
          onClick={onReview}
          disabled={isLoading}
        >
          Revizuiește
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// CELEBRATION ANIMATION EXAMPLE (Requirements 5.1-5.5)
// ============================================================================

export const AnimatedCelebration: React.FC<{
  score: number
  totalQuestions: number
  isVisible: boolean
  onContinue: () => void
}> = ({ score, totalQuestions, isVisible, onContinue }) => {
  const { getAnimationClasses, createTransition, prefersReducedMotion, getComplexDuration } = useAppleAnimations()
  const celebrationRef = useRef<HTMLDivElement>(null)

  // Use animation lifecycle for performance optimization
  useAnimationLifecycle(celebrationRef, isVisible)

  const percentage = Math.round((score / totalQuestions) * 100)
  const celebrationClasses = getAnimationClasses('CELEBRATION').join(' ')

  // Determine performance level and message
  const getPerformanceData = () => {
    if (percentage >= 80) {
      return {
        level: 'excellent',
        message: 'Felicitări! Rezultat excelent!',
        className: 'apple-celebration-excellent',
        color: '#FFD700'
      }
    } else if (percentage >= 60) {
      return {
        level: 'good',
        message: 'Bună treabă! Continuă să exersezi!',
        className: 'apple-celebration-good',
        color: '#007AFF'
      }
    } else {
      return {
        level: 'supportive',
        message: 'Nu te descuraja! Încearcă din nou!',
        className: 'apple-celebration-supportive',
        color: '#8E8E93'
      }
    }
  }

  const performanceData = getPerformanceData()

  const overlayStyle: React.CSSProperties = {
    transition: createTransition(['opacity', 'backdrop-filter']),
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? 'auto' : 'none'
  }

  const contentStyle: React.CSSProperties = {
    transition: createTransition(['transform', 'opacity'], getComplexDuration()),
    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
    opacity: isVisible ? 1 : 0
  }

  if (!isVisible && !prefersReducedMotion) {
    return null
  }

  return (
    <div className={`quiz-celebration-overlay ${celebrationClasses}`} style={overlayStyle}>
      <div
        ref={celebrationRef}
        className={`quiz-celebration-content ${performanceData.className}`}
        style={contentStyle}
      >
        <div
          className='score-circle'
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: `4px solid ${performanceData.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px',
            fontWeight: '600',
            color: performanceData.color
          }}
        >
          {percentage}%
        </div>

        <h2 className='apple-text-display apple-mb-md'>{performanceData.message}</h2>

        <p className='apple-text-body-large apple-mb-lg'>
          {score} din {totalQuestions} răspunsuri corecte
        </p>

        <button
          className='quiz-submit-button apple-submit-button'
          onClick={onContinue}
          style={{
            backgroundColor: performanceData.color,
            color: 'white'
          }}
        >
          Continuă
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// COMPREHENSIVE QUIZ INTERFACE EXAMPLE
// ============================================================================

export const AnimatedQuizInterface: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

  // Mock data
  const questions = [
    {
      id: 1,
      text: 'Care este capitala Franței?',
      options: [
        { value: 'A', label: 'A. Londra' },
        { value: 'B', label: 'B. Berlin' },
        { value: 'C', label: 'C. Paris' },
        { value: 'D', label: 'D. Madrid' }
      ]
    },
    {
      id: 2,
      text: 'Care este cel mai mare ocean?',
      options: [
        { value: 'A', label: 'A. Atlantic' },
        { value: 'B', label: 'B. Pacific' },
        { value: 'C', label: 'C. Indian' },
        { value: 'D', label: 'D. Arctic' }
      ]
    }
  ]

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setShowCelebration(true)
  }

  const handleContinue = () => {
    setShowCelebration(false)
    // Navigate to results or next page
  }

  // Simulate scroll behavior for compact mode
  React.useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100

  return (
    <div className='quiz-interface'>
      <AnimatedProgressCard title='Test de Geografie' progress={progress} timeRemaining={15} isCompact={isCompact} />

      <div className='quiz-content apple-container'>
        {questions.map((question, index) => (
          <AnimatedQuestionCard
            key={question.id}
            questionNumber={index + 1}
            totalQuestions={questions.length}
            questionText={question.text}
          >
            {question.options.map(option => (
              <AnimatedRadioOption
                key={option.value}
                id={`q${question.id}-${option.value}`}
                value={option.value}
                label={option.label}
                isSelected={answers[question.id] === option.value}
                onChange={value => handleAnswerChange(question.id, value)}
              />
            ))}
          </AnimatedQuestionCard>
        ))}

        <AnimatedSubmitCard
          answeredQuestions={answeredCount}
          totalQuestions={questions.length}
          isLoading={isSubmitting}
          onSubmit={handleSubmit}
          onReview={() => console.log('Review clicked')}
        />
      </div>

      <AnimatedCelebration
        score={1} // Mock score
        totalQuestions={questions.length}
        isVisible={showCelebration}
        onContinue={handleContinue}
      />
    </div>
  )
}

export default AnimatedQuizInterface
