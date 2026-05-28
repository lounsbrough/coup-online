export const COUP_GOLD = 'rgb(255, 187, 10)'

export const CARD_SHADOW = '1px 1px 1px rgba(0, 0, 0, 0.8)'
export const CARD_TEXT_SHADOW = { textShadow: CARD_SHADOW }
export const CARD_ICON_FILTER = { filter: `drop-shadow(${CARD_SHADOW})` }

export const getDiscreteGradient = (colors: string[]) => {
  if (!colors.length) return undefined
  if (colors.length === 1) return colors[0]

  const numColors = colors.length
  const getPercentage = (index: number) => (index / (numColors)) * 100
  const getStop = (color: string, index: number) => `${color} ${getPercentage(index)}%`
  const stops = colors.flatMap((color, i) => [getStop(color, i), getStop(color, i + 1)])

  return `linear-gradient(${stops.join(', ')})`
}
