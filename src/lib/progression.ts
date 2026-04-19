export type SeaObject = {
  id: string
  emoji: string
  label: string
  requiredScore: number
  style: { bottom: string; left: string; fontSize: string }
}

export const SEA_OBJECTS: SeaObject[] = [
  { id: 'shell1',      emoji: '🐚', label: 'Shell',       requiredScore: 1,  style: { bottom: '8%',  left: '15%', fontSize: '1.5rem' } },
  { id: 'shell2',      emoji: '🐚', label: 'Shell',       requiredScore: 2,  style: { bottom: '6%',  left: '80%', fontSize: '1.2rem' } },
  { id: 'seaweed1',    emoji: '🌿', label: 'Seaweed',     requiredScore: 3,  style: { bottom: '12%', left: '55%', fontSize: '2rem'   } },
  { id: 'seaweed2',    emoji: '🌿', label: 'Seaweed',     requiredScore: 4,  style: { bottom: '10%', left: '35%', fontSize: '1.8rem' } },
  { id: 'coral1',      emoji: '🪸', label: 'Coral',       requiredScore: 5,  style: { bottom: '10%', left: '70%', fontSize: '2.2rem' } },
  { id: 'coral2',      emoji: '🪸', label: 'Coral',       requiredScore: 7,  style: { bottom: '8%',  left: '25%', fontSize: '2rem'   } },
  { id: 'fish1',       emoji: '🐠', label: 'Tropical Fish', requiredScore: 8,  style: { bottom: '45%', left: '20%', fontSize: '2rem'   } },
  { id: 'fish2',       emoji: '🐟', label: 'Fish',        requiredScore: 10, style: { bottom: '55%', left: '65%', fontSize: '1.8rem' } },
  { id: 'coral3',      emoji: '🪸', label: 'Large Coral', requiredScore: 12, style: { bottom: '9%',  left: '48%', fontSize: '2.8rem' } },
  { id: 'crab',        emoji: '🦀', label: 'Crab',        requiredScore: 15, style: { bottom: '5%',  left: '60%', fontSize: '1.8rem' } },
  { id: 'turtle',      emoji: '🐢', label: 'Turtle',      requiredScore: 18, style: { bottom: '35%', left: '80%', fontSize: '2.2rem' } },
  { id: 'octopus',     emoji: '🐙', label: 'Octopus',     requiredScore: 22, style: { bottom: '25%', left: '10%', fontSize: '2.5rem' } },
  { id: 'dolphin',     emoji: '🐬', label: 'Dolphin',     requiredScore: 28, style: { bottom: '60%', left: '45%', fontSize: '2.5rem' } },
  { id: 'whale',       emoji: '🐋', label: 'Whale',       requiredScore: 35, style: { bottom: '70%', left: '30%', fontSize: '3rem'   } },
]

export function getUnlockedObjects(progressScore: number, healthScore: number): SeaObject[] {
  return SEA_OBJECTS.filter(obj => obj.requiredScore <= progressScore)
    .map(obj => ({
      ...obj,
      // dim objects when health is low
      style: { ...obj.style, opacity: healthScore < 50 ? '0.4' : '1' },
    }))
}

export function getProgressLabel(score: number): string {
  if (score === 0) return 'Empty ocean floor'
  if (score < 3)  return 'A shell appears...'
  if (score < 5)  return 'Seaweed is growing'
  if (score < 8)  return 'Coral is forming'
  if (score < 12) return 'Fish have arrived'
  if (score < 20) return 'A thriving reef'
  if (score < 30) return 'Rich biodiversity'
  return 'A flourishing ecosystem'
}
