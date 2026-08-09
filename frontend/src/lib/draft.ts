import {
  EMPTY_CUSTOMER_FORM,
  type CustomerFormState,
  type SelectedEquipment,
} from '../types'
import type { LookupMode } from '../components/questions/LookupQuestion'
import { STEPS } from './steps'

const DRAFT_KEY = 'fieldquote-estimate-draft-v1'

export interface EstimateDraft {
  stepIndex: number
  lookupMode: LookupMode
  customerForm: CustomerFormState
  jobType: string
  level: string
  hours: number
  selectedEquipment: SelectedEquipment[]
  notes: string
  estimateId: string
}

export function emptyDraft(estimateId: string): EstimateDraft {
  return {
    stepIndex: 0,
    lookupMode: 'ask',
    customerForm: EMPTY_CUSTOMER_FORM,
    jobType: '',
    level: '',
    hours: 0,
    selectedEquipment: [],
    notes: '',
    estimateId,
  }
}

export function loadDraft(fallbackEstimateId: string): EstimateDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft(fallbackEstimateId)
    const parsed = JSON.parse(raw) as Partial<EstimateDraft>
    return {
      ...emptyDraft(fallbackEstimateId),
      ...parsed,
      stepIndex: Math.min(Math.max(Number(parsed.stepIndex) || 0, 0), STEPS.length - 1),
      customerForm: { ...EMPTY_CUSTOMER_FORM, ...parsed.customerForm },
      selectedEquipment: Array.isArray(parsed.selectedEquipment) ? parsed.selectedEquipment : [],
      estimateId: typeof parsed.estimateId === 'string' ? parsed.estimateId : fallbackEstimateId,
    }
  } catch {
    return emptyDraft(fallbackEstimateId)
  }
}

export function saveDraft(draft: EstimateDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Storage may be unavailable in private browsing; the estimator still works in memory.
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
