import { Button } from '@mui/material'
import { Coffee } from '@mui/icons-material'
import { useTranslationContext } from '../../contexts/TranslationsContext'

function BuyMeACoffeeButton() {
  const { t } = useTranslationContext()

  return (
    <Button
      href="https://www.buymeacoffee.com/davidlounsbrough"
      target="_blank"
      rel="noopener noreferrer"
      variant="contained"
      startIcon={<Coffee />}
    >
      {t('buyMeACoffee')}
    </Button>
  )
}

export default BuyMeACoffeeButton
