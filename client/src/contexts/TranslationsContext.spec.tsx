import { useEffect } from "react"
import { grey } from "@mui/material/colors"
import { Actions, EventMessages, PublicGameState } from "@shared"
import { TranslationContextProvider, useTranslationContext } from "./TranslationsContext"
import { render } from '../../tests/utilities/render'
import { AvailableLanguageCode } from "../i18n/availableLanguages"

const TestTranslationComponent = ({ language }: { language: AvailableLanguageCode }) => {
  const { t, setLanguage } = useTranslationContext()

  useEffect(() => {
    setLanguage(language)
  }, [])

  return (
    <>
      <p data-testid={`${EventMessages.ActionProcessed}-${Actions.Coup}`}>
        {t(EventMessages.ActionProcessed, {
          action: Actions.Coup,
          gameState: ({
            players: [
              { color: 'blue', name: 'David' },
              { color: 'red', name: 'Bob' }
            ]
          }) as unknown as PublicGameState,
          primaryPlayer: 'David',
          secondaryPlayer: 'Bob'
        })}
        {t('close')}
      </p>
    </>
  )
}

describe('TranslationContextProvider', () => {
  it('should translate action with template parameters', async () => {
    const { getByTestId, getByText } = render(
      <TranslationContextProvider>
        <TestTranslationComponent language={AvailableLanguageCode["pt-BR"]} />
      </TranslationContextProvider>
    )

    expect(getByTestId(`${EventMessages.ActionProcessed}-${Actions.Coup}`))
      .toHaveTextContent('David golpeou Bob')
    expect(getByText('David')).toHaveStyle({ color: 'blue' })
    expect(getByText('golpeou')).toHaveStyle({ color: grey['700'] })
    expect(getByText('Bob')).toHaveStyle({ color: 'red' })
  })

  it('should translate plain text', async () => {
    const { getByText } = render(
      <TranslationContextProvider>
        <TestTranslationComponent language={AvailableLanguageCode["pt-BR"]} />
      </TranslationContextProvider>
    )

    getByText('Fechar')
  })
})
