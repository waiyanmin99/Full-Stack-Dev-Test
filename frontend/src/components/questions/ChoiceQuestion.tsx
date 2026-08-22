export interface ChoiceOption {
  value: string
  label: string
  helper?: string
}

interface ChoiceQuestionProps {
  options: ChoiceOption[]
  value: string
  onSelect: (value: string) => void
  onContinue?: () => void
  compact?: boolean
}

export default function ChoiceQuestion({
  options,
  value,
  onSelect,
  onContinue,
  compact = false,
}: ChoiceQuestionProps) {
  function handleClick(optionValue: string) {
    onSelect(optionValue)
    if (onContinue) {
      window.setTimeout(onContinue, 220)
    }
  }

  return (
    <div className={`choice-list${compact ? ' choice-list--grid' : ''}`}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`choice-option${compact ? ' choice-option--compact' : ''}${value === option.value ? ' choice-option--active' : ''}`}
          onClick={() => handleClick(option.value)}
        >
          <span className="choice-option__label">{option.label}</span>
          {option.helper && <span className="choice-option__helper">{option.helper}</span>}
        </button>
      ))}
    </div>
  )
}
