import Fab from '@mui/material/Fab'
import { Gavel } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { useTranslationContext } from '../../contexts/TranslationsContext'

const fabSize = 56

interface RulesBubbleProps {
  rulesOpen: boolean
  setRulesOpen: (open: boolean) => void
  wiggle?: boolean
  setWiggle?: (wiggle: boolean) => void
}

export default function RulesBubble({ rulesOpen, setRulesOpen, wiggle, setWiggle }: RulesBubbleProps) {
  const { t } = useTranslationContext()

  if (rulesOpen) return null

  return (
    <Tooltip title={t('rules')}>
      <Fab
        onClick={() => { setRulesOpen(true); setWiggle?.(false) }}
        color="primary"
        sx={{
          height: fabSize,
          width: fabSize,
          ml: 3,
          mb: 3,
          position: 'fixed',
          bottom: 0,
          left: 0,
          animation: wiggle ? 'pulseRulesBubble 1.25s infinite' : undefined,
          "@keyframes pulseRulesBubble": {
            "0%": { transform: 'scale(1) rotateZ(0)' },
            "8%": { transform: 'scale(1.15) rotateZ(5deg)' },
            "16%": { transform: 'scale(1) rotateZ(0)' },
            "24%": { transform: 'scale(1.3) rotateZ(10deg)' },
            "80%": { transform: 'scale(1) rotateZ(0)' },
            "100%": { transform: 'scale(1) rotateZ(0)' }
          },
        }}
      >
        <Gavel fontSize='large' />
      </Fab>
    </Tooltip>
  )
}
