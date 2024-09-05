import { useMemo } from 'react';
import { Typography, TypographyProps } from "@mui/material";
import { useGameStateContext } from "../../context/GameStateContext";
import { useColorModeContext } from "../../context/MaterialThemeContext";
import { ActionAttributes, InfluenceAttributes } from "../../shared/types/game";

function GameTypography({ children, ...props }: Omit<TypographyProps, 'children'> & {
  children: string
}) {
  const { gameState } = useGameStateContext();
  const { colorMode } = useColorModeContext();

  const colorsMap: [string, string][] = useMemo(() => {
    if (!gameState?.players) {
      return [];
    }

    return [
      ...Object.entries(ActionAttributes)
        .filter(([action]) => children.includes(action))
        .map<[string, string]>(([action, attributes]) => [action, attributes.color[colorMode]]),
      ...Object.entries(InfluenceAttributes)
        .filter(([influence]) => children.includes(influence))
        .map<[string, string]>(([influence, attributes]) => [influence, attributes.color[colorMode]]),
      ...gameState?.players
        .filter(({ name }) => children.includes(name))
        .map<[string, string]>(({ name, color }) => [name, color])
    ];
  }, [children, gameState?.players, colorMode]);

  type Segment = { text: string, position: number, color?: string, fontWeight?: string }

  const remainingSegments: Segment[] = [{ text: children, position: 0 }];
  const coloredSegments: Segment[] = [];
  colorsMap.forEach(([match, color]) => {
    remainingSegments.forEach((remainingSegment, i) => {
      const matchedIndexes = [...remainingSegment.text.matchAll(new RegExp(match, 'g'))].map(({ index }) => index)
      if (matchedIndexes.length) {
        remainingSegments.splice(i, 1);
        let lastEnd = 0;
        matchedIndexes.forEach((matchedIndex) => {
          if (matchedIndex! > lastEnd) {
            remainingSegments.push({
              text: remainingSegment.text.slice(lastEnd, matchedIndex! - lastEnd),
              position: remainingSegment.position + lastEnd
            });
          }
          coloredSegments.push({
            text: match,
            position: remainingSegment.position + matchedIndex!,
            color,
            fontWeight: 'bold'
          });
          lastEnd = matchedIndex! + match.length;
        });
        if (lastEnd < remainingSegment.text.length - 1) {
          remainingSegments.push({
            text: remainingSegment.text.slice(lastEnd),
            position: remainingSegment.position + lastEnd
          });
        }
      }
    });
  });

  const finalSegments = [...remainingSegments, ...coloredSegments]
    .sort((a, b) => a.position - b.position);

  return (
    <Typography {...props}>
      {finalSegments.map(({ text, color, fontWeight }, index) =>
        <Typography
          {...props}
          key={index}
          component='span'
          color={color}
          fontWeight={fontWeight}
        >{text}</Typography>)}
    </Typography>
  );
}

export default GameTypography;
