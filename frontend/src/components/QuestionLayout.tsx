import type { ReactNode } from 'react'

interface QuestionLayoutProps {
  stepNumber: number
  totalSteps: number
  onBack?: () => void
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export default function QuestionLayout({
  stepNumber,
  totalSteps,
  onBack,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: QuestionLayoutProps) {
  const progress = Math.round((stepNumber / totalSteps) * 100)

  return (
    <div className="question-page">
      <div className="question-progress no-print">
        <div className="question-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="question-topbar no-print">
        {onBack ? (
          <button type="button" className="question-back" onClick={onBack}>
            <span aria-hidden="true">‹</span> Back
          </button>
        ) : (
          <span />
        )}
        <span className="question-step-count">
          Step {stepNumber} of {totalSteps}
        </span>
      </div>

      <main className="question-main">
        <div className="question-card">
          {eyebrow && <span className="question-eyebrow">{eyebrow}</span>}
          <h1 className="question-title">{title}</h1>
          {subtitle && <p className="question-subtitle">{subtitle}</p>}
          <div className="question-content">{children}</div>
        </div>
      </main>

      {footer && <div className="question-footer no-print">{footer}</div>}
    </div>
  )
}
