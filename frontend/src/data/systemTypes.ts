export interface SystemTypeSuggestion {
  name: string
  category: 'Common residential' | 'Heat pump' | 'Commercial' | 'Heating only' | 'Cooling only'
  description: string
  keywords?: string
}

// Common system configurations from the provided customer/equipment data, supplemented with
// U.S. Department of Energy and ENERGY STAR heating-and-cooling categories.
export const SYSTEM_TYPE_SUGGESTIONS: SystemTypeSuggestion[] = [
  {
    name: 'Central AC + Gas Furnace',
    category: 'Common residential',
    description: 'Ducted split cooling with a gas-fired forced-air furnace.',
    keywords: 'central air conditioner natural gas forced air split',
  },
  {
    name: 'Central AC + Electric Furnace',
    category: 'Common residential',
    description: 'Ducted central cooling paired with electric resistance heat.',
    keywords: 'central air conditioner electric forced air split',
  },
  {
    name: 'Ducted Air-Source Heat Pump',
    category: 'Heat pump',
    description: 'One ducted system provides both heating and cooling.',
    keywords: 'central heat pump air handler',
  },
  {
    name: 'Ductless Mini-Split Heat Pump',
    category: 'Heat pump',
    description: 'One outdoor unit serves one or more ductless indoor zones.',
    keywords: 'mini split minisplit single zone multi zone',
  },
  {
    name: 'Dual-Fuel Heat Pump + Gas Furnace',
    category: 'Heat pump',
    description: 'Heat pump with a gas furnace as supplemental or backup heat.',
    keywords: 'hybrid dual fuel air source',
  },
  {
    name: 'Geothermal (Ground-Source) Heat Pump',
    category: 'Heat pump',
    description: 'Transfers heat through a ground loop for heating and cooling.',
    keywords: 'ground source water source ghp',
  },
  {
    name: 'Packaged HVAC Unit',
    category: 'Common residential',
    description: 'Heating and cooling components are housed in one outdoor cabinet.',
    keywords: 'package unit all in one',
  },
  {
    name: 'Rooftop Unit (RTU)',
    category: 'Commercial',
    description: 'Packaged heating and cooling equipment installed on the roof.',
    keywords: 'commercial package unit rooftop',
  },
  {
    name: 'VRF / VRV System',
    category: 'Commercial',
    description: 'Variable-refrigerant-flow system serving multiple indoor zones.',
    keywords: 'commercial variable refrigerant volume multi zone',
  },
  {
    name: 'Chiller + Air Handlers / Fan Coils',
    category: 'Commercial',
    description: 'Central chilled-water plant distributes cooling to building zones.',
    keywords: 'commercial chilled water fan coil ahu',
  },
  {
    name: 'Boiler + Radiators / Baseboard',
    category: 'Heating only',
    description: 'A boiler distributes hot water or steam through pipes.',
    keywords: 'hydronic radiant heat steam',
  },
  {
    name: 'Gas Furnace Only',
    category: 'Heating only',
    description: 'Gas-fired forced-air heating without central cooling recorded.',
    keywords: 'natural gas forced air heat',
  },
  {
    name: 'Electric Furnace / Resistance Heat',
    category: 'Heating only',
    description: 'Electric resistance equipment provides space heating.',
    keywords: 'electric baseboard forced air heat',
  },
  {
    name: 'Central Air Conditioner Only',
    category: 'Cooling only',
    description: 'Ducted central cooling without heating equipment recorded.',
    keywords: 'central ac split system cooling',
  },
  {
    name: 'Ductless Mini-Split AC Only',
    category: 'Cooling only',
    description: 'Ductless zoned cooling without heat-pump operation recorded.',
    keywords: 'mini split minisplit room air conditioner',
  },
  {
    name: 'Evaporative Cooler',
    category: 'Cooling only',
    description: 'Water evaporation provides cooling, typically in dry climates.',
    keywords: 'swamp cooler',
  },
]

export function matchingSystemTypes(query: string, limit = 7): SystemTypeSuggestion[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return SYSTEM_TYPE_SUGGESTIONS.slice(0, limit)

  return SYSTEM_TYPE_SUGGESTIONS.filter((system) => {
    const searchable = `${system.name} ${system.category} ${system.description} ${system.keywords ?? ''}`
      .toLowerCase()
    return terms.every((term) => searchable.includes(term))
  }).slice(0, limit)
}
