import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { useMemo } from 'react'

const desktopDrawerWidth = '25vw'

interface ResponsiveDrawerProps {
  side: 'left' | 'right'
  mainContent: React.ReactNode
  drawerContent: React.ReactNode
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
}

export default function ResponsiveDrawer({ side, mainContent, drawerContent, drawerOpen, setDrawerOpen }: ResponsiveDrawerProps) {
  const { isLargeScreen } = useTheme()

  const Main = useMemo(() =>
    styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
      open?: boolean;
    }>(({ theme }) => {
      const sideMargin = side === 'left' ? 'marginLeft' : 'marginRight'
      return ({
        flexGrow: 1,
        padding: 0,
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        [sideMargin]: `-${desktopDrawerWidth}`,
        position: 'relative',
        variants: [
          {
            props: ({ open }) => open,
            style: {
              transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
              [sideMargin]: 0,
            },
          },
        ],
      })
    }), [side])

  return (
    <>
      {isLargeScreen ? (
        <Box sx={{ display: 'flex' }}>
          <Main open={drawerOpen}>
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
            anchor={side}
            open={drawerOpen}
            slotProps={{ root: { keepMounted: true } }}
          >
            {drawerContent}
          </Drawer>
        </Box>
      ) : (
        <>
          {mainContent}
          <Drawer
            anchor={side}
            open={drawerOpen}
            onClose={() => { setDrawerOpen(false) }}
            slotProps={{ root: { keepMounted: true } }}
          >
            {drawerContent}
          </Drawer>
        </>
      )}
    </>
  )
}
