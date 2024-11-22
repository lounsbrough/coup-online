import { useMemo } from 'react'
import { Typography, TypographyProps, useTheme } from "@mui/material"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { Actions, Influences } from '@shared'

function ColoredTypography({ children, ...props }: Omit<TypographyProps, 'children'> & {
  children: string
}) {
  const { gameState } = useGameStateContext()
  const { actionColors, influenceColors } = useTheme()

  const colorsMap: [string, string | undefined][] = useMemo(() => {
    if (!gameState?.players) {
      return []
    }

    return [
      ...Object.values(Influences)
        .filter((influence) => children.includes(influence))
        .map<[string, string]>((influence) => [influence, influenceColors[influence]]),
      ...Object.values(Actions)
        .filter((action) => children.includes(action))
        .map<[string, string | undefined]>((action) => [action, actionColors[action]]),
      ...gameState.players
        .filter(({ name }) => children.includes(name))
        .sort((a, b) => a.name.length - b.name.length)
        .map<[string, string]>(({ name, color }) => [name, color])
    ]
  }, [children, gameState?.players, actionColors, influenceColors])

  type Segment = { text: string, position: number, color?: string, fontWeight?: string }

  const coloredSegments: Segment[] = []

  const matchedSpecialWords = colorsMap.length ? [
    ...children.matchAll(new RegExp(colorsMap.map(([match]) =>
      `(?<!\\S)${match}(?!\\S)`).join('|'), 'g'))
  ]
    .map(({ index: position, '0': word }) => ({ position, word }))
    .sort((a, b) => a.position! - b.position!) : []

  let nonColoredSegments: Segment[]
  if (matchedSpecialWords.length) {
    nonColoredSegments = []
    if (matchedSpecialWords[0].position! > 0) {
      nonColoredSegments.push({
        text: children.slice(0, matchedSpecialWords[0].position!),
        position: 0
      })
    }
    matchedSpecialWords.forEach((matchedSpecialWord, i) => {
      coloredSegments.push({
        text: matchedSpecialWord.word,
        position: matchedSpecialWord.position!,
        color: colorsMap.find(([match]) => match === matchedSpecialWord.word)?.[1] ?? '',
        fontWeight: 'bold'
      })
      const nonColoredPosition = matchedSpecialWord.position! + matchedSpecialWord.word.length
      if (nonColoredPosition < children.length - 1) {
        const nonColoredEnd = i < matchedSpecialWords.length - 1 ? matchedSpecialWords[i + 1].position! : undefined
        nonColoredSegments.push({
          text: children.slice(nonColoredPosition, nonColoredEnd),
          position: nonColoredPosition
        })
      }
    })
  } else {
    nonColoredSegments = [{ text: children, position: 0 }]
  }

  const finalSegments = [...nonColoredSegments, ...coloredSegments]
    .sort((a, b) => a.position - b.position)

  return (
    <Typography {...props}>
      {finalSegments.map(({ text, color, fontWeight }, index) =>
        <Typography
          {...props}
          key={index}
          component='span'
          fontWeight={fontWeight ?? 'inherit'}
          sx={color ? { color } : {}}
        >{text}</Typography>)}
    </Typography>
  )
}

export default ColoredTypography
