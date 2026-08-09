export interface ChoiceOption {
  value: string
  label: string
  helper?: string
}

interface ChoiceQuestionProps {
  options: ChoiceOption[]
  value: string
  onSelect: (value: string) => void
  onContinue: () => void
}

export default function ChoiceQuestion({ options, value, onSelect, onContinue }: ChoiceQuestionProps) {
  function handleClick(optionValue: string) {
    onSelect(optionValue)
    window.setTimeout(onContinue, 220)
  }

  return (
    <div className="choice-list">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={`choice-option${value === option.value ? ' choice-option--active' : ''}`}
          onClick={() => handleClick(option.value)}
        >
          <span className="choice-option__label">{option.label}</span>
          {option.helper && <span className="choice-option__helper">{option.helper}</span>}
        </button>
      ))}
    </div>
  )
}
