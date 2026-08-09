import type { Equipment, LaborRate, SelectedEquipment } from '../types'

export function defaultHoursFor(rate: LaborRate): number {
  const mid = (rate.estimatedHours.min + rate.estimatedHours.max) / 2
  return Math.round(mid * 4) / 4 // nearest quarter hour
}

export function laborCost(rate: LaborRate | undefined, hours: number): number {
  if (!rate) return 0
  return rate.hourlyRate * hours
}

export function partsCost(selected: SelectedEquipment[], catalog: Equipment[]): number {
  return selected.reduce((sum, line) => {
    const item = catalog.find((eq) => eq.id === line.equipmentId)
    return sum + (item ? item.baseCost * line.quantity : 0)
  }, 0)
}

export function laborRange(rate: LaborRate | undefined): { min: number; max: number } {
  if (!rate) return { min: 0, max: 0 }
  return {
    min: rate.hourlyRate * rate.estimatedHours.min,
    max: rate.hourlyRate * rate.estimatedHours.max,
  }
}

export function generateEstimateId(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  const suffix = Math.floor(Math.random() * 900 + 100)
  return `EST-${y}${m}${d}-${suffix}`
}
