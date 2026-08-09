interface NotesQuestionProps {
  value: string
  onChange: (value: string) => void
}

export default function NotesQuestion({ value, onChange }: NotesQuestionProps) {
  return (
    <textarea
      autoFocus
      className="question-input question-textarea"
      rows={5}
      value={value}
      placeholder="e.g. Customer requested weekend install, attic access limited…"
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
