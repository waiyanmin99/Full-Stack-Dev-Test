const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const currencyFormatterPrecise = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number, precise = false): string {
  return precise ? currencyFormatterPrecise.format(value) : currencyFormatter.format(value)
}

export function formatHours(hours: number): string {
  return `${hours % 1 === 0 ? hours : hours.toFixed(2)} hr${hours === 1 ? '' : 's'}`
}

export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Keeps only the national-number digits (drops a leading "1" country code, if present).
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, '')
  const trimmed = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  return trimmed.slice(0, 10)
}

// Formats progressively as digits are typed: "213" -> "(213" -> "(213) 555" -> "(213) 555-0142"
export function formatUSPhone(digits: string): string {
  const d = phoneDigits(digits)
  if (d.length === 0) return ''
  if (d.length < 4) return `(${d}`
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}
