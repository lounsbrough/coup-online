import { useMemo, createContext, useContext, ReactNode } from 'react'
import { createTheme, useMediaQuery, PaletteMode, GlobalStyles, ThemeProvider, PaletteColor } from '@mui/material'
import { grey } from '@mui/material/colors'
import { activeColorModeStorageKey } from '../helpers/localStorageKeys'
import { Actions, Influences } from '@shared'
import { usePersistedState } from '../hooks/usePersistedState'

declare module '@mui/material/styles' {
  interface Theme {
    isSmallScreen: boolean
    isLargeScreen: boolean
    actionColors: { [Action in Actions]: string }
    influenceColors: { [influence in Influences]: string }
  }
  interface ThemeOptions {
    isSmallScreen: boolean
    isLargeScreen: boolean
    actionColors: { [Action in Actions]: string }
    influenceColors: { [influence in Influences]: string }
  }

  type CustomPalette = Record<Influences, PaletteColor> & Record<Actions, PaletteColor>;
  type CustomPaletteOptions = Partial<Record<Influences, PaletteColor>> & Partial<Record<Actions, PaletteColor>>;

  interface Palette extends CustomPalette { }
  interface PaletteOptions extends CustomPaletteOptions { }
}

declare module '@mui/material/Button' {
  type CustomButtonOverrides = Record<Influences, true> & Record<Actions, true>;

  interface ButtonPropsColorOverrides extends CustomButtonOverrides { }
}

export const LIGHT_COLOR_MODE = 'light'
export const DARK_COLOR_MODE = 'dark'
export const SYSTEM_COLOR_MODE = 'system'

export type AppColorMode = PaletteMode | typeof SYSTEM_COLOR_MODE;

type ColorModeContextType = {
  colorMode: PaletteMode
  internalColorMode: AppColorMode,
  setColorMode: (newMode: AppColorMode) => void
}

export const ColorModeContext = createContext<ColorModeContextType>({
  colorMode: DARK_COLOR_MODE,
  internalColorMode: SYSTEM_COLOR_MODE,
  setColorMode: () => { }
})

export function MaterialThemeContextProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [mode, setMode] = usePersistedState<AppColorMode>(
    activeColorModeStorageKey,
    SYSTEM_COLOR_MODE
  )

  const isSmallScreen = useMediaQuery('screen and (max-width: 899px)')
  const isLargeScreen = useMediaQuery('screen and (min-width: 1200px)')

  // Always use DARK_COLOR_MODE for now
  const activeColorMode: PaletteMode = DARK_COLOR_MODE
  const isLightMode = false

  // const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  // let activeColorMode: PaletteMode
  // if (mode === SYSTEM_COLOR_MODE) {
  //   activeColorMode = prefersDarkMode ? DARK_COLOR_MODE : LIGHT_COLOR_MODE
  // } else {
  //   activeColorMode = mode
  // }

  // const isLightMode = activeColorMode === LIGHT_COLOR_MODE

  const colorMode = useMemo(
    () => ({
      colorMode: activeColorMode,
      internalColorMode: mode,
      setColorMode: (newMode: AppColorMode) => setMode(newMode)
    }),
    [mode, activeColorMode]
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
      [Influences.Duke]: isLightMode ? '#73007B' : '#AA35B2'
    }

    const actionColors = {
      [Actions.Assassinate]: influenceColors[Influences.Assassin],
      [Actions.Coup]: primaryColor,
      [Actions.Exchange]: influenceColors[Influences.Ambassador],
      [Actions.ForeignAid]: primaryColor,
      [Actions.Income]: primaryColor,
      [Actions.Revive]: primaryColor,
      [Actions.Steal]: influenceColors[Influences.Captain],
      [Actions.Tax]: influenceColors[Influences.Duke]
    }

    let theme = createTheme({
      ...(process.env.REACT_APP_DISABLE_TRANSITIONS ? {
        transitions: {
          create: () => 'none',
        }
      } : {}),
      palette: {
        mode: activeColorMode,
        background: (isLightMode ? {} : { default: grey[800] }),
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
        MuiTooltip: {
          defaultProps: { enterTouchDelay: 50, leaveTouchDelay: 3000, placement: 'top', arrow: true }
        },
        MuiTypography: {
          styleOverrides: {
            body1: {
              fontSize: isLargeScreen ? undefined : '1rem'
            },
            body2: {
              fontSize: isLargeScreen ? undefined : '0.9rem'
            },
            h1: {
              fontSize: isLargeScreen ? undefined : '1.7rem'
            },
            h2: {
              fontSize: isLargeScreen ? undefined : '1.6rem'
            },
            h3: {
              fontSize: isLargeScreen ? undefined : '1.5rem'
            },
            h4: {
              fontSize: isLargeScreen ? undefined : '1.4rem'
            },
            h5: {
              fontSize: isLargeScreen ? undefined : '1.3rem'
            },
            h6: {
              fontSize: isLargeScreen ? undefined : '1.2rem'
            }
          }
        }
      }
    })

    const customPaletteColors = Object.fromEntries([
      ...Object.values(Influences)
        .map((influence) => [
          influence,
          theme.palette.augmentColor({
            color: {
              main: theme.influenceColors[influence],
            },
            name: influence,
          })
        ]),
      ...Object.values(Actions)
        .map((action) => [
          action,
          theme.palette.augmentColor({
            color: {
              main: theme.actionColors[action],
            },
            name: action,
          })
        ])
    ])

    theme = createTheme(theme, {
      palette: customPaletteColors
    })

    return theme
  }, [isLightMode, activeColorMode, isSmallScreen, isLargeScreen])

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: `${defaultBackgroundColor} !important`,
            colorScheme: activeColorMode
          },
          html: { colorScheme: activeColorMode }
        }}
      />
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={materialTheme}>
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  )
}

export const useColorModeContext = () => useContext(ColorModeContext)
