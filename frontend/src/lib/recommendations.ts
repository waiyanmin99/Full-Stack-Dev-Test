import type { CustomerFormState, Equipment } from '../types'
import { estimatedSystemAge } from '../data/systemAges.ts'

export interface EquipmentRecommendation {
  item: Equipment
  reason: string
}

function addByIds(
  recommendations: EquipmentRecommendation[],
  catalog: Equipment[],
  ids: string[],
  reason: string,
) {
  ids.forEach((id) => {
    const item = catalog.find((candidate) => candidate.id === id)
    if (item && !recommendations.some((entry) => entry.item.id === id)) {
      recommendations.push({ item, reason })
    }
  })
}

export function recommendEquipment(
  customer: CustomerFormState,
  jobType: string,
  level: string,
  catalog: Equipment[],
): EquipmentRecommendation[] {
  const system = customer.systemType.toLowerCase()
  const hasCentralAc =
    system.includes('central ac') ||
    system.includes('air conditioner') ||
    /\bac\b/.test(system)
  const age = estimatedSystemAge(customer.systemAge)
  const recommendations: EquipmentRecommendation[] = []
  const isInstall = jobType === 'install'
  const isMajorRepair = jobType === 'repair' && level === 'major'
  const furnaceOrBoilerOnly =
    (system.includes('furnace') || system.includes('boiler')) &&
    !hasCentralAc &&
    !system.includes('heat pump')
  const replacementReview =
    age !== undefined && age >= (furnaceOrBoilerOnly ? 15 : 10)

  if (isInstall || replacementReview) {
    const ageReason = age !== undefined ? `Existing system is approximately ${Math.round(age)} years old.` : 'Matches the selected installation.'
    if (system.includes('mini')) addByIds(recommendations, catalog, ['EQ005', 'EQ006'], ageReason)
    else if (system.includes('rooftop') || system.includes('rtu')) addByIds(recommendations, catalog, ['EQ007'], ageReason)
    else if (system.includes('package')) addByIds(recommendations, catalog, ['EQ008'], ageReason)
    else if (system.includes('heat pump') || system.includes('dual-fuel') || system.includes('geothermal')) {
      addByIds(recommendations, catalog, ['EQ002', 'EQ024'], ageReason)
    } else if (system.includes('furnace') && !system.includes('ac')) {
      addByIds(recommendations, catalog, ['EQ003', 'EQ010'], ageReason)
    } else if (hasCentralAc) {
      addByIds(recommendations, catalog, ['EQ001', 'EQ009'], ageReason)
      if (system.includes('furnace') && (isInstall || (age !== undefined && age >= 15))) {
        addByIds(recommendations, catalog, ['EQ003'], 'Evaluate matched indoor and outdoor equipment together.')
      }
    }
  }

  if (jobType === 'repair') {
    if (system.includes('furnace') || system.includes('gas')) {
      addByIds(
        recommendations,
        catalog,
        isMajorRepair ? ['EQ022', 'EQ020', 'EQ012'] : ['EQ023', 'EQ022', 'EQ020'],
        'Common service part for the recorded furnace; confirm diagnosis and compatibility.',
      )
    }
    if (
      hasCentralAc ||
      system.includes('heat pump') ||
      system.includes('rooftop') ||
      system.includes('package')
    ) {
      addByIds(
        recommendations,
        catalog,
        isMajorRepair ? ['EQ011', 'EQ014', 'EQ013'] : ['EQ018', 'EQ013', 'EQ019'],
        'Common service part for this cooling system; confirm diagnosis and model compatibility.',
      )
    }
  }

  if (jobType === 'maintenance') {
    addByIds(
      recommendations,
      catalog,
      ['EQ016', 'EQ027'],
      'Optional maintenance upgrade; add only after confirming customer need and compatibility.',
    )
  }

  return recommendations.slice(0, 6)
}
