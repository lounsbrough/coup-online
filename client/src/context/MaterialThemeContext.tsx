import { useState, useMemo, createContext, useEffect, useContext, ReactNode } from 'react';
import { createTheme, ThemeProvider, GlobalStyles, useMediaQuery, PaletteMode } from '@mui/material';
import { grey, blueGrey } from '@mui/material/colors';

export const LIGHT_COLOR_MODE = 'light';
export const DARK_COLOR_MODE = 'dark';
export const SYSTEM_COLOR_MODE = 'system';
export const primaryColor = {
  [LIGHT_COLOR_MODE]: '#0464c4',
  [DARK_COLOR_MODE]: '#41A5F6'
};
export const secondaryColor = {
  [LIGHT_COLOR_MODE]: '#293E87',
  [DARK_COLOR_MODE]: blueGrey[200]
};

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
});

const activeColorModeStorageKey = 'coupActiveColorMode';

export function MaterialThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppColorMode>(
    (localStorage.getItem(activeColorModeStorageKey) as AppColorMode | null) ?? SYSTEM_COLOR_MODE
  );

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  let activeColorMode: PaletteMode;
  if (mode === SYSTEM_COLOR_MODE) {
    activeColorMode = prefersDarkMode ? DARK_COLOR_MODE : LIGHT_COLOR_MODE;
  } else {
    activeColorMode = mode;
  }

  const colorMode = useMemo(
    () => ({
      colorMode: activeColorMode,
      internalColorMode: mode,
      setColorMode: (newMode: AppColorMode) => setMode(newMode)
    }),
    [mode, activeColorMode]
  );

  useEffect(() => {
    localStorage.setItem(activeColorModeStorageKey, mode);
  }, [mode]);

  const isLightMode = activeColorMode === LIGHT_COLOR_MODE;
  const white = '#ffffff';
  const defaultBackgroundColor = isLightMode ? white : '#212121';

  const materialTheme = useMemo(() => createTheme({
    palette: {
      mode: activeColorMode,
      background: (isLightMode ? {} : { default: grey[800] }),
      primary: {
        main: primaryColor[activeColorMode]
      },
      secondary: {
        main: secondaryColor[activeColorMode]
      }
    }
  }), [isLightMode, activeColorMode]);

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
  );
}

export const useColorModeContext = () => useContext(ColorModeContext);
