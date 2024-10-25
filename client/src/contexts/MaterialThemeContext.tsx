import { useState, useMemo, createContext, useEffect, useContext, ReactNode } from 'react'
import { createTheme, useMediaQuery, PaletteMode, GlobalStyles, ThemeProvider, PaletteColor } from '@mui/material'
import { grey } from '@mui/material/colors'
import { activeColorModeStorageKey } from '../helpers/localStorageKeys'
import { Actions, Influences } from '@shared'

declare module '@mui/material/styles' {
  interface Theme {
    isSmallScreen: boolean
    actionColors: { [Action in Actions]: string }
    influenceColors: { [influence in Influences]: string }
  }
  interface ThemeOptions {
    isSmallScreen: boolean
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

export function MaterialThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppColorMode>(
    (localStorage.getItem(activeColorModeStorageKey) as AppColorMode | null) ?? SYSTEM_COLOR_MODE
  )

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const isSmallScreen = useMediaQuery('screen and (max-width: 899px)')

  let activeColorMode: PaletteMode
  if (mode === SYSTEM_COLOR_MODE) {
    activeColorMode = prefersDarkMode ? DARK_COLOR_MODE : LIGHT_COLOR_MODE
  } else {
    activeColorMode = mode
  }

  const colorMode = useMemo(
    () => ({
      colorMode: activeColorMode,
      internalColorMode: mode,
      setColorMode: (newMode: AppColorMode) => setMode(newMode)
    }),
    [mode, activeColorMode]
  )

  useEffect(() => {
    localStorage.setItem(activeColorModeStorageKey, mode)
  }, [mode])

  const isLightMode = activeColorMode === LIGHT_COLOR_MODE
  const defaultBackgroundColor = isLightMode ? '#ffffff' : '#212121'

  const materialTheme = useMemo(() => {
    const primaryColor = isLightMode ? grey['700'] : grey['500']

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
      [Actions.Steal]: influenceColors[Influences.Captain],
      [Actions.Tax]: influenceColors[Influences.Duke]
    }

    let theme = createTheme({
      palette: {
        mode: activeColorMode,
        background: (isLightMode ? {} : { default: grey[800] }),
        primary: {
          main: primaryColor
        }
      },
      isSmallScreen,
      actionColors,
      influenceColors,
      spacing: isSmallScreen ? 4 : 8,
      components: {
        MuiTypography: {
          styleOverrides: {
            body1: {
              fontSize: isSmallScreen ? '1rem' : undefined
            },
            body2: {
              fontSize: isSmallScreen ? '0.9rem' : undefined
            },
            h1: {
              fontSize: isSmallScreen ? '1.7rem' : undefined
            },
            h2: {
              fontSize: isSmallScreen ? '1.6rem' : undefined
            },
            h3: {
              fontSize: isSmallScreen ? '1.5rem' : undefined
            },
            h4: {
              fontSize: isSmallScreen ? '1.4rem' : undefined
            },
            h5: {
              fontSize: isSmallScreen ? '1.3rem' : undefined
            },
            h6: {
              fontSize: isSmallScreen ? '1.2rem' : undefined
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
  }, [isLightMode, activeColorMode, isSmallScreen])

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
