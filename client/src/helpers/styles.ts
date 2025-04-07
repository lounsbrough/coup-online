export const getDiscreteGradient = (colors: string[]) => {
  if (!colors.length) return undefined
  if (colors.length === 1) return colors[0]

  const stops: string[] = []
  const numColors = colors.length

  colors.forEach((color, index) => {
    const percentage = (index / (numColors)) * 100
    stops.push(`${color} ${percentage}%`)
    if (index < numColors - 1) {
      const nextPercentage = ((index + 1) / (numColors)) * 100
      stops.push(`${color} ${nextPercentage}%`)
    }
  })

  return `linear-gradient(${stops.join(', ')})`
}
