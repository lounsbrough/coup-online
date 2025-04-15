import { ChevronLeft, Close, Gavel } from "@mui/icons-material"
import {
  Box,
  Drawer,
  CssBaseline,
  useTheme,
  IconButton,
  Typography,
  Divider,
} from "@mui/material"
import { useTranslationContext } from "../../contexts/TranslationsContext"

const dektopDrawerWidth = `30vw`

interface MainContentProps {
  openLeft: boolean
  openRight: boolean
  children: React.ReactNode
}

const MainContent = ({ openLeft, openRight, children }: MainContentProps) => {
  const theme = useTheme()

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ...(theme.isLargeScreen && {
          ml: openLeft ? `${dektopDrawerWidth}` : 0,
          mr: openRight ? `${dektopDrawerWidth}` : 0,
          width: `calc(100% - ${openLeft ? dektopDrawerWidth : 0} - ${openRight ? dektopDrawerWidth : 0})`,
        }),
        boxSizing: "border-box",
        minHeight: "100vh",
        transition: (openLeft || openRight)
          ? theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          })
          : theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Box sx={{ width: "100%" }}>
        {children}
      </Box>
    </Box >
  )
}

interface DualSideDrawerProps {
  openLeft: boolean
  openRight: boolean
  setOpenLeft: (open: boolean) => void
  setOpenRight: (open: boolean) => void
  leftDrawerContent: React.ReactNode
  rightDrawerContent: React.ReactNode
  children: React.ReactNode
}

const DualSideDrawer = ({ openLeft, openRight, setOpenLeft, setOpenRight, leftDrawerContent, rightDrawerContent, children }: DualSideDrawerProps) => {
  const theme = useTheme()
  const { t } = useTranslationContext()

  const LeftCloseIcon = theme.isLargeScreen ? ChevronLeft : Close

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        slotProps={{
          paper: {
            sx: {
              width: theme.isLargeScreen ? (openLeft ? dektopDrawerWidth : 0) : undefined,
              boxSizing: 'border-box',
              overflowX: 'hidden',
              transition: (theme) =>
                theme.transitions.create(["width", "maxWidth"], {
                  easing: theme.transitions.easing[openLeft ? 'easeOut' : 'sharp'],
                  duration: theme.transitions.duration[openLeft ? 'enteringScreen' : 'leavingScreen'],
                }),
            }
          }
        }}
        sx={{
          maxWidth: theme.isLargeScreen ? dektopDrawerWidth : undefined,
          flexShrink: 0,
          transition: (theme) =>
            theme.transitions.create(["width", "maxWidth"], {
              easing: theme.transitions.easing[openLeft ? 'easeOut' : 'sharp'],
              duration: theme.transitions.duration[openLeft ? 'enteringScreen' : 'leavingScreen'],
            }),
        }}
        variant={theme.isLargeScreen ? 'persistent' : 'temporary'}
        anchor="left"
        open={openLeft}
        onClose={() => setOpenLeft(false)}
      >
        <Box sx={{ p: theme.isLargeScreen ? 1.4 : 4, display: 'flex', alignItems: 'center' }}>
          <Typography flexGrow={1} textAlign="center" variant='h5'>
            <Gavel sx={{ verticalAlign: 'middle', mr: 1 }} />
            <span style={{ verticalAlign: 'middle' }}>{t('rules')}</span>
          </Typography>
          <IconButton sx={{ position: 'absolute', right: 0, mr: 1 }} onClick={() => { setOpenLeft(false) }}>
            <LeftCloseIcon fontSize="large" />
          </IconButton>
        </Box>
        <Divider />
        {leftDrawerContent}
      </Drawer>
      <Drawer
        slotProps={{
          paper: {
            sx: {
              width: theme.isLargeScreen ? (openRight ? dektopDrawerWidth : 0) : undefined,
              transition: (theme) =>
                theme.transitions.create(["width", "maxWidth"], {
                  easing: theme.transitions.easing[openRight ? 'easeOut' : 'sharp'],
                  duration: theme.transitions.duration[openRight ? 'enteringScreen' : 'leavingScreen'],
                }),
            }
          }
        }}
        sx={{
          maxWidth: theme.isLargeScreen ? dektopDrawerWidth : undefined,
          flexShrink: 0,
          transition: (theme) =>
            theme.transitions.create(["width", "maxWidth"], {
              easing: theme.transitions.easing[openRight ? 'easeOut' : 'sharp'],
              duration: theme.transitions.duration[openRight ? 'enteringScreen' : 'leavingScreen'],
            }),
        }}
        variant={theme.isLargeScreen ? 'persistent' : 'temporary'}
        anchor="right"
        open={openRight}
        onClose={() => setOpenRight(false)}
      >
        {rightDrawerContent}
      </Drawer>
      <MainContent openLeft={openLeft} openRight={openRight}>
        {children}
      </MainContent>
    </Box>
  )
}

export default DualSideDrawer
