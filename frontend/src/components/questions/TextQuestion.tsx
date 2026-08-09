interface TextQuestionProps {
  type?: 'text' | 'tel' | 'number'
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  canSubmit: boolean
  placeholder?: string
}

export default function TextQuestion({
  type = 'text',
  value,
  onChange,
  onSubmit,
  canSubmit,
  placeholder,
}: TextQuestionProps) {
  return (
    <input
      autoFocus
      type={type}
      inputMode={type === 'number' ? 'numeric' : undefined}
      className="question-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && canSubmit) onSubmit()
      }}
    />
  )
}
