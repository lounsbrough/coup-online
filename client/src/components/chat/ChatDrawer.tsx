import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import ChatDrawerContent from './ChatDrawerContent'

const desktopDrawerWidth = '25vw'

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: `-${desktopDrawerWidth}`,
  position: 'relative',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      },
    },
  ],
}))

interface ChatDrawerProps {
  chatOpen: boolean
  setChatOpen: (open: boolean) => void
  setLatestReadMessageId: (id: string | null) => void
  mainContent: React.ReactNode
}

export default function ChatDrawer({ chatOpen, setChatOpen, setLatestReadMessageId, mainContent }: ChatDrawerProps) {
  const { isLargeScreen } = useTheme()

  return isLargeScreen ? (
    <Box sx={{ display: 'flex' }}>
      <Main open={chatOpen}>
        {mainContent}
      </Main>
      <Drawer
        sx={{
          width: desktopDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: desktopDrawerWidth,
          },
        }}
        variant="persistent"
        anchor="right"
        open={chatOpen}
        slotProps={{ root: { keepMounted: true } }}
      >
        <ChatDrawerContent chatOpen={chatOpen} setChatOpen={setChatOpen} setLatestReadMessageId={setLatestReadMessageId} />
      </Drawer>
    </Box>
  ) : (
    <>
      {mainContent}
      <Drawer
        anchor="right"
        open={chatOpen}
        onClose={() => { setChatOpen(false) }}
        slotProps={{ root: { keepMounted: true } }}
      >
        <ChatDrawerContent chatOpen={chatOpen} setChatOpen={setChatOpen} setLatestReadMessageId={setLatestReadMessageId} />
      </Drawer>
    </>
  )
}
