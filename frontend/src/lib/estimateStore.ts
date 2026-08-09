import type { CustomerFormState, SelectedEquipment } from '../types.ts'

const SAVED_ESTIMATES_KEY = 'fieldquote-saved-estimates-v1'
const MAX_SAVED_ESTIMATES = 20

export interface SavedEstimate {
  estimateId: string
  savedAt: string
  customerForm: CustomerFormState
  jobType: string
  level: string
  hours: number
  selectedEquipment: SelectedEquipment[]
  notes: string
  total: number
}

export function upsertSavedEstimate(
  estimates: SavedEstimate[],
  estimate: SavedEstimate,
): SavedEstimate[] {
  const withoutCurrent = estimates.filter((entry) => entry.estimateId !== estimate.estimateId)
  return [estimate, ...withoutCurrent]
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, MAX_SAVED_ESTIMATES)
}

export function loadSavedEstimates(): SavedEstimate[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_ESTIMATES_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as SavedEstimate[]) : []
  } catch {
    return []
  }
}

export function persistSavedEstimates(estimates: SavedEstimate[]): void {
  try {
    localStorage.setItem(SAVED_ESTIMATES_KEY, JSON.stringify(estimates))
  } catch {
    // The active estimate still works when browser storage is unavailable.
  }
}
