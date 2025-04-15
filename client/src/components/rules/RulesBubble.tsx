import Fab from '@mui/material/Fab'
import { Gavel } from '@mui/icons-material'

const fabSize = 56

interface RulesBubbleProps {
  setRulesOpen: (open: boolean) => void
}

export default function RulesBubble({ setRulesOpen }: RulesBubbleProps) {

  return (
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
  )
}
