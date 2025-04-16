import React from "react"
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material"
import {
  Box,
  Drawer,
  CssBaseline,
  useTheme,
  IconButton,
  Typography,
  Divider,
} from "@mui/material"

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

interface SideDrawerProps {
  side: 'left' | 'right'
  open: boolean
  setOpen: (open: boolean) => void
  drawerContent: React.ReactNode
  drawerHeader: React.ReactNode
}

const SideDrawer = ({ side, open, setOpen, drawerContent, drawerHeader }: SideDrawerProps) => {
  const theme = useTheme()

  const transition = () =>
    theme.transitions.create(["width", "maxWidth"], {
      easing: theme.transitions.easing[open ? 'easeOut' : 'sharp'],
      duration: theme.transitions.duration[open ? 'enteringScreen' : 'leavingScreen'],
    })

  const CloseIcon = theme.isLargeScreen
    ? (side === 'right' ? ChevronRight : ChevronLeft)
    : Close

  return (
    <Drawer
      slotProps={{
        paper: {
          sx: {
            width: theme.isLargeScreen ? (open ? dektopDrawerWidth : 0) : undefined,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition,
          }
        }
      }}
      sx={{
        maxWidth: theme.isLargeScreen ? dektopDrawerWidth : undefined,
        flexShrink: 0,
        transition,
      }}
      variant={theme.isLargeScreen ? 'persistent' : 'temporary'}
      anchor={side}
      open={open}
      onClose={() => setOpen(false)}
    >
      <IconButton sx={{
        position: 'absolute',
        [side === 'right' ? 'left' : 'right']: 0,
        m: theme.isLargeScreen ? 0.1 : 1,
      }} onClick={() => { setOpen(false) }}>
        <CloseIcon fontSize="large" />
      </IconButton>
      <Box sx={{ p: theme.isLargeScreen ? 1.3 : 4, display: 'flex' }}>
        <Typography display="flex" flexGrow={1} textAlign="center" variant='h5' justifyContent="center" alignItems="center">
          {drawerHeader}
        </Typography>
      </Box>
      <Divider />
      {drawerContent}
    </Drawer>
  )
}

interface DualSideDrawerProps {
  openLeft: boolean
  openRight: boolean
  setOpenLeft: (open: boolean) => void
  setOpenRight: (open: boolean) => void
  leftDrawerContent: React.ReactNode
  rightDrawerContent: React.ReactNode
  leftDrawerHeader: React.ReactNode
  rightDrawerHeader: React.ReactNode
  children: React.ReactNode
}

const DualSideDrawer = ({
  openLeft, openRight, setOpenLeft, setOpenRight,
  leftDrawerContent, rightDrawerContent, leftDrawerHeader, rightDrawerHeader,
  children
}: DualSideDrawerProps) => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <SideDrawer
        side="left"
        open={openLeft}
        setOpen={setOpenLeft}
        drawerContent={leftDrawerContent}
        drawerHeader={leftDrawerHeader}
      />
      <SideDrawer
        side="right"
        open={openRight}
        setOpen={setOpenRight}
        drawerContent={rightDrawerContent}
        drawerHeader={rightDrawerHeader}
      />
      <MainContent openLeft={openLeft} openRight={openRight}>
        {children}
      </MainContent>
    </Box >
  )
}

export default DualSideDrawer
