import { createContext, useContext } from 'react'
import {
  PaletteMode,
  PaletteColor,
} from '@mui/material'
import { Actions, Influences } from '@shared'

declare module '@mui/material/styles' {
  interface Theme {
    isSmallScreen: boolean;
    isLargeScreen: boolean;
    actionColors: { [Action in Actions]: string };
    influenceColors: { [influence in Influences]: string };
  }
  interface ThemeOptions {
    isSmallScreen: boolean;
    isLargeScreen: boolean;
    actionColors: { [Action in Actions]: string };
    influenceColors: { [influence in Influences]: string };
  }

  type CustomPalette = Record<Influences, PaletteColor> &
    Record<Actions, PaletteColor>;
  type CustomPaletteOptions = Partial<Record<Influences, PaletteColor>> &
    Partial<Record<Actions, PaletteColor>>;

  interface Palette extends CustomPalette {}
  interface PaletteOptions extends CustomPaletteOptions {}
}

declare module '@mui/material/Button' {
  type CustomButtonOverrides = Record<Influences, true> & Record<Actions, true>;

  interface ButtonPropsColorOverrides extends CustomButtonOverrides {}
}

export const LIGHT_COLOR_MODE = 'light'
export const DARK_COLOR_MODE = 'dark'
export const SYSTEM_COLOR_MODE = 'system'

export type AppColorMode = PaletteMode | typeof SYSTEM_COLOR_MODE;

type ColorModeContextType = {
  colorMode: PaletteMode;
  internalColorMode: AppColorMode;
  setColorMode: (newMode: AppColorMode) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>({
  colorMode: DARK_COLOR_MODE,
  internalColorMode: SYSTEM_COLOR_MODE,
  setColorMode: () => {},
})

export const useColorModeContext = () => useContext(ColorModeContext)
