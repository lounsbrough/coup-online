import {
  Box,
  Drawer,
  IconButton,
  Toolbar,
  CssBaseline,
  useTheme,
  Fab,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"

const dektopDrawerWidth = `25vw`

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
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ...(openLeft && {
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
        ...(openRight && {
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
      }}
    >
      <Box sx={{ width: "100%" }}>
        {children}
      </Box>
      {/* <Box sx={{ width: "100%" }}>
        <Typography component="p">
          This is your main content. The drawers will expand from the sides when
          opened.
        </Typography>
      </Box> */}
    </Box>
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

  const handleLeftDrawerToggle = () => {
    setOpenLeft(!openLeft)
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Box
        sx={{
          position: "fixed",
          top: theme.spacing(2),
          left: theme.spacing(2),
          zIndex: theme.zIndex.mobileStepper,
        }}
      >
        <Fab
          color="primary"
          aria-label="open left drawer"
          onClick={handleLeftDrawerToggle}
        >
          {openLeft ? <ArrowBackIosNewIcon /> : <MenuIcon />}
        </Fab>
      </Box>
      <Box
        sx={{
          position: "fixed",
          top: theme.spacing(2),
          right: theme.spacing(2),
          zIndex: theme.zIndex.mobileStepper,
        }}
      >
      </Box>
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
