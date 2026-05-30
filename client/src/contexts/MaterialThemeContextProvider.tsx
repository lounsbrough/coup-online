import { useMemo, ReactNode } from 'react'
import {
  createTheme,
  useMediaQuery,
  PaletteMode,
  GlobalStyles,
  ThemeProvider,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { Check, Close } from '@mui/icons-material'
import { activeColorModeStorageKey } from '../helpers/localStorageKeys'
import { Actions, Influences } from '@shared'
import { usePersistedState } from '../hooks/usePersistedState'
import {
  AppColorMode,
  ColorModeContext,
  DARK_COLOR_MODE,
  SYSTEM_COLOR_MODE,
} from './MaterialThemeContext'
import { useGameSettingsContext } from './GameSettingsContext'

function MaterialThemeContextProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [mode, setMode] = usePersistedState<AppColorMode>(
    activeColorModeStorageKey,
    SYSTEM_COLOR_MODE,
  )

  const isSmallScreen = useMediaQuery('screen and (max-width: 899px)')
  const isLargeScreen = useMediaQuery('screen and (min-width: 1200px)')
  const { useInquisitor } = useGameSettingsContext()

  // Always use DARK_COLOR_MODE for now
  const activeColorMode: PaletteMode = DARK_COLOR_MODE
  const isLightMode = false

  const colorMode = useMemo(
    () => ({
      colorMode: activeColorMode,
      internalColorMode: mode,
      setColorMode: (newMode: AppColorMode) => setMode(newMode),
    }),
    [mode, activeColorMode, setMode],
  )

  const defaultBackgroundColor = isLightMode ? '#ffffff' : '#212121'

  const materialTheme = useMemo(() => {
    const primaryColor = isLightMode ? grey['700'] : grey['400']
    const secondaryColor = isLightMode ? grey['500'] : grey['600']

    const influenceColors = {
      [Influences.Assassin]: isLightMode ? '#7A0000' : '#B23535',
      [Influences.Contessa]: isLightMode ? '#9B6000' : '#C38E3A',
      [Influences.Captain]: isLightMode ? '#00338A' : '#3868BA',
      [Influences.Ambassador]: isLightMode ? '#3D6600' : '#78A831',
      [Influences.Inquisitor]: isLightMode ? '#1A5C5C' : '#3A9E9E',
      [Influences.Duke]: isLightMode ? '#73007B' : '#AA35B2',
    }

    const actionColors = {
      [Actions.Assassinate]: influenceColors[Influences.Assassin],
      [Actions.Coup]: primaryColor,
      [Actions.Exchange]: useInquisitor ? influenceColors[Influences.Inquisitor] : influenceColors[Influences.Ambassador],
      [Actions.Examine]: influenceColors[Influences.Inquisitor],
      [Actions.Convert]: primaryColor,
      [Actions.Embezzle]: primaryColor,
      [Actions.ForeignAid]: primaryColor,
      [Actions.Income]: primaryColor,
      [Actions.Revive]: primaryColor,
      [Actions.Steal]: influenceColors[Influences.Captain],
      [Actions.Tax]: influenceColors[Influences.Duke],
    }

    let theme = createTheme({
      ...(import.meta.env.VITE_DISABLE_TRANSITIONS
        ? {
            transitions: {
              create: () => 'none',
            },
          }
        : {}),
      palette: {
        mode: activeColorMode,
        background: isLightMode ? {} : { default: grey[800] },
        primary: {
          main: primaryColor,
        },
        secondary: {
          main: secondaryColor,
        },
      },
      isSmallScreen,
      isLargeScreen,
      actionColors,
      influenceColors,
      spacing: isLargeScreen ? 8 : 4,
      components: {
        MuiSwitch: {
          defaultProps: {
            color: 'success',
            icon: <Close sx={{ width: 20, height: 20, padding: 0.25, color: 'grey.600', backgroundColor: 'grey.300', borderRadius: '50%', strokeWidth: 1, stroke: 'currentcolor', boxShadow: 1 }} />,
            checkedIcon: <Check sx={{ width: 20, height: 20, padding: 0.25, color: 'text.primary', backgroundColor: 'success.main', borderRadius: '50%', strokeWidth: 1, stroke: 'currentcolor', boxShadow: 1 }} />,
          },
        },
        MuiTooltip: {
          defaultProps: {
            enterTouchDelay: 50,
            leaveTouchDelay: 3000,
            placement: 'top',
            arrow: true,
          },
        },
        MuiTypography: {
          styleOverrides: {
            body1: {
              fontSize: isLargeScreen ? undefined : '1rem',
            },
            body2: {
              fontSize: isLargeScreen ? undefined : '0.9rem',
            },
            h1: {
              fontSize: isLargeScreen ? undefined : '1.7rem',
            },
            h2: {
              fontSize: isLargeScreen ? undefined : '1.6rem',
            },
            h3: {
              fontSize: isLargeScreen ? undefined : '1.5rem',
            },
            h4: {
              fontSize: isLargeScreen ? undefined : '1.4rem',
            },
            h5: {
              fontSize: isLargeScreen ? undefined : '1.3rem',
            },
            h6: {
              fontSize: isLargeScreen ? undefined : '1.2rem',
            },
          },
        },
      },
    })

    const customPaletteColors = Object.fromEntries([
      ...Object.values(Influences).map((influence) => [
        influence,
        theme.palette.augmentColor({
          color: {
            main: theme.influenceColors[influence],
          },
          name: influence,
        }),
      ]),
      ...Object.values(Actions).map((action) => [
        action,
        theme.palette.augmentColor({
          color: {
            main: theme.actionColors[action],
          },
          name: action,
        }),
      ]),
    ])

    theme = createTheme(theme, {
      palette: customPaletteColors,
      components: {
        MuiCircularProgress: {
          styleOverrides: {
            root: {
              opacity: 0.75,
            },
          },
        },
      },
    })

    return theme
  }, [isLightMode, activeColorMode, isSmallScreen, isLargeScreen, useInquisitor])

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: `${defaultBackgroundColor} !important`,
            colorScheme: activeColorMode,
          },
          html: { colorScheme: activeColorMode },
        }}
      />
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={materialTheme}>{children}</ThemeProvider>
      </ColorModeContext.Provider>
    </>
  )
}

export default MaterialThemeContextProvider
