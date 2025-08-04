import Fab from '@mui/material/Fab'
import { Gavel } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { useTranslationContext } from '../../contexts/TranslationsContext'

const fabSize = 56

interface RulesBubbleProps {
  rulesOpen: boolean
  setRulesOpen: (open: boolean) => void
}

export default function RulesBubble({ rulesOpen, setRulesOpen }: RulesBubbleProps) {
  const { t } = useTranslationContext()

  if (rulesOpen) return null

  return (
    <Tooltip title={t('rules')}>
      <Fab
        onClick={() => { setRulesOpen(true) }}
        color="primary"
        sx={{
          height: fabSize,
          width: fabSize,
          ml: 3,
          mb: 3,
          position: 'fixed',
          bottom: 0,
          left: 0,
        }}
      >
        <Gavel fontSize='large' />
      </Fab>
    </Tooltip>
  )
}
