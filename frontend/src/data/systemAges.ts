export interface SystemAgeSuggestion {
  value: string
  label: string
  description: string
  minYears?: number
  maxYears?: number
}

// ENERGY STAR suggests professional replacement evaluation after 10 years for heat pumps/air
// conditioners and after 15 years for furnaces/boilers. Age alone is never a replacement verdict.
export const SYSTEM_AGE_SUGGESTIONS: SystemAgeSuggestion[] = [
  {
    value: 'Unknown',
    label: 'Unknown',
    description: 'Check the equipment nameplate or installation record on site.',
  },
  {
    value: 'Less than 1 year',
    label: 'Less than 1 year',
    description: 'Recently installed; confirm warranty and commissioning records.',
    minYears: 0,
    maxYears: 0,
  },
  {
    value: '1–5 years',
    label: '1–5 years',
    description: 'Early service life; repair and maintenance are usually the first evaluation path.',
    minYears: 1,
    maxYears: 5,
  },
  {
    value: '6–10 years',
    label: '6–10 years',
    description: 'Record condition and repair history as equipment approaches mid-life.',
    minYears: 6,
    maxYears: 10,
  },
  {
    value: '11–15 years',
    label: '11–15 years',
    description: 'Evaluate AC and heat-pump efficiency; furnaces and boilers may still be serviceable.',
    minYears: 11,
    maxYears: 15,
  },
  {
    value: '16–20 years',
    label: '16–20 years',
    description: 'Evaluate repair versus replacement for all major system types.',
    minYears: 16,
    maxYears: 20,
  },
  {
    value: '21–25 years',
    label: '21–25 years',
    description: 'Older equipment; inspect condition, safety, efficiency, and parts availability.',
    minYears: 21,
    maxYears: 25,
  },
  {
    value: 'More than 25 years',
    label: 'More than 25 years',
    description: 'Document exact model and condition before recommending repair or replacement.',
    minYears: 26,
  },
]

export function matchingSystemAges(query: string): SystemAgeSuggestion[] {
  const trimmed = query.trim()
  if (trimmed === '') return SYSTEM_AGE_SUGGESTIONS

  const exactYears = Number(trimmed)
  if (Number.isFinite(exactYears) && exactYears >= 0) {
    return SYSTEM_AGE_SUGGESTIONS.filter(
      (age) =>
        age.minYears !== undefined &&
        exactYears >= age.minYears &&
        (age.maxYears === undefined || exactYears <= age.maxYears),
    )
  }

  const q = trimmed.toLowerCase()
  return SYSTEM_AGE_SUGGESTIONS.filter((age) =>
    `${age.label} ${age.description}`.toLowerCase().includes(q),
  )
}

export function estimatedSystemAge(value: string): number | undefined {
  const numeric = Number(value)
  if (Number.isFinite(numeric) && numeric >= 0) return numeric

  const suggestion = SYSTEM_AGE_SUGGESTIONS.find((age) => age.value === value)
  if (!suggestion || suggestion.minYears === undefined) return undefined
  if (suggestion.maxYears === undefined) return suggestion.minYears
  return (suggestion.minYears + suggestion.maxYears) / 2
}

export function formatSystemAge(value: string): string {
  if (value.trim() === '') return ''
  return Number.isFinite(Number(value)) ? `${value} yrs` : value
}
