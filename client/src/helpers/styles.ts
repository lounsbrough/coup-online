export const getDiscreteGradient = (colors: string[]) => {
  if (!colors.length) return undefined
  if (colors.length === 1) return colors[0]

  const numColors = colors.length
  const getPercentage = (index: number) => (index / (numColors)) * 100
  const getStop = (color: string, index: number) => `${color} ${getPercentage(index)}%`
  const stops = colors.flatMap((color, i) => [getStop(color, i), getStop(color, i + 1)])

  return `linear-gradient(${stops.join(', ')})`
}
