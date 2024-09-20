import ColoredTypography from "./ColoredTypography"
import { render, getRandomGameState, getCurrentColorMode } from '../../../tests/utilities/render'
import { ActionAttributes, Actions, InfluenceAttributes, Influences } from '@shared'

describe('ColoredTypography', () => {
  it('should render a single element when no matches found', async () => {
    const { findByText } = render(<ColoredTypography>text to color</ColoredTypography>)

    await findByText('text to color')
  })

  it('should render multiple colored elements when matches found', async () => {
    const gameState = getRandomGameState()

    gameState.players[0].name = 'David'
    gameState.players[1].name = 'Dаvid'

    const { findByText } = render(
      <>
        <ColoredTypography>David is trying to use Coup on Dаvid</ColoredTypography>
        <ColoredTypography>someone has lost their Contessa</ColoredTypography>
      </>,
      { gameState }
    )

    const colorMode = await getCurrentColorMode()

    const expectedSegments = [
      { text: 'David', color: gameState.players[0].color },
      { text: ' is trying to use ' },
      { text: 'Coup', color: ActionAttributes[Actions.Coup].color[colorMode] },
      { text: ' on ' },
      { text: 'Dаvid', color: gameState.players[1].color },
      { text: 'someone has lost their ' },
      { text: 'Contessa', color: InfluenceAttributes[Influences.Contessa].color[colorMode] }
    ]

    for (const expectedSegment of expectedSegments) {
      const segment = await findByText(expectedSegment.text, { trim: false })
      if (expectedSegment.color) {
        expect(segment).toHaveStyle({ color: expectedSegment.color })
      }
    }
  })
})
