import { useMemo } from 'react'
import { Typography, TypographyProps } from "@mui/material"
import { useGameStateContext } from "../../contexts/GameStateContext"
import { useColorModeContext } from "../../contexts/MaterialThemeContext"
import { ActionAttributes, InfluenceAttributes } from '@shared'

function ColoredTypography({ children, ...props }: Omit<TypographyProps, 'children'> & {
  children: string
}) {
  const { gameState } = useGameStateContext()
  const { colorMode } = useColorModeContext()

  const colorsMap: [string, string][] = useMemo(() => {
    if (!gameState?.players) {
      return []
    }

    return [
      ...Object.entries(ActionAttributes)
        .filter(([action]) => children.includes(action))
        .map<[string, string]>(([action, attributes]) => [action, attributes.color[colorMode]]),
      ...Object.entries(InfluenceAttributes)
        .filter(([influence]) => children.includes(influence))
        .map<[string, string]>(([influence, attributes]) => [influence, attributes.color[colorMode]]),
      ...gameState.players
        .filter(({ name }) => children.includes(name))
        .sort((a, b) => a.name.length - b.name.length)
        .map<[string, string]>(({ name, color }) => [name, color])
    ]
  }, [children, gameState?.players, colorMode])

  type Segment = { text: string, position: number, color?: string, fontWeight?: string }

  const coloredSegments: Segment[] = []

  const matchedSpecialWords = colorsMap.length ? [
    ...children.matchAll(new RegExp(colorsMap.map(([match]) => `(?<!\\S)${match}(?!\\S)`).join('|'), 'g'))
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
        color: colorsMap.find(([match]) => match === matchedSpecialWord.word)?.[1],
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
          sx={{ color }}
        >{text}</Typography>)}
    </Typography>
  )
}

export default ColoredTypography
