export interface SystemAgeSuggestion {
  value: string
  label: string
  description: string
}

const COMMON_AGE_YEARS = [1, 5, 10, 15, 20, 25, 30]

function ageDescription(years: number): string {
  if (years === 0) return 'New installation; confirm commissioning and warranty records.'
  if (years < 5) return 'Relatively new equipment; check maintenance and warranty history.'
  if (years < 10) return 'Inspect condition, service history, and current performance.'
  if (years < 15) return 'Evaluate efficiency, repair history, and remaining service life.'
  if (years < 20) return 'Compare repair cost with replacement options and safety needs.'
  return 'Inspect safety, efficiency, condition, and parts availability carefully.'
}

function suggestionForYears(years: number): SystemAgeSuggestion {
  const value = String(years)
  return {
    value,
    label: value,
    description: ageDescription(years),
  }
}

export const SYSTEM_AGE_SUGGESTIONS = COMMON_AGE_YEARS.map(suggestionForYears)

export function matchingSystemAges(query: string): SystemAgeSuggestion[] {
  const trimmed = query.trim()
  if (trimmed === '') return SYSTEM_AGE_SUGGESTIONS
  if (!/^\d{1,3}$/.test(trimmed)) return []

  const exactYears = Number(trimmed)
  if (!Number.isInteger(exactYears) || exactYears < 0 || exactYears > 100) return []
  return [suggestionForYears(exactYears)]
}

export function estimatedSystemAge(value: string): number | undefined {
  const numeric = Number(value)
  if (Number.isInteger(numeric) && numeric >= 0 && numeric <= 100) return numeric

  // Preserve recommendation behavior for drafts saved by older versions of the app.
  const legacyRange = value.match(/^(\d+)\D+(\d+)\s*years?$/i)
  if (legacyRange) return (Number(legacyRange[1]) + Number(legacyRange[2])) / 2
  return undefined
}

export function formatSystemAge(value: string): string {
  if (value.trim() === '') return ''
  return Number.isFinite(Number(value)) ? `${Number(value)} yrs` : value
}
