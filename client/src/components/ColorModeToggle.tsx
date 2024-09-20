import { LightMode, DarkMode, SettingsBrightness } from '@mui/icons-material'
import { Button } from '@mui/material'
import { AppColorMode, DARK_COLOR_MODE, LIGHT_COLOR_MODE, SYSTEM_COLOR_MODE, useColorModeContext } from '../contexts/MaterialThemeContext'
import { toTitleCase } from '../helpers/grammar'

function ColorModeToggle() {
  const { internalColorMode, setColorMode } = useColorModeContext()

  const nextMap: { [colorMode in AppColorMode]: AppColorMode } = {
    [SYSTEM_COLOR_MODE]: DARK_COLOR_MODE,
    [DARK_COLOR_MODE]: LIGHT_COLOR_MODE,
    [LIGHT_COLOR_MODE]: SYSTEM_COLOR_MODE
  }

  const nextMode: AppColorMode = nextMap[internalColorMode]

  const setNewMode = () => setColorMode(nextMode)

  const iconMap: { [colorMode in AppColorMode]: JSX.Element } = {
    [SYSTEM_COLOR_MODE]: <SettingsBrightness />,
    [LIGHT_COLOR_MODE]: <LightMode />,
    [DARK_COLOR_MODE]: <DarkMode />
  }

  return (
    <Button
      variant='outlined'
      onClick={setNewMode}
      startIcon={iconMap[internalColorMode]}
    >
      {toTitleCase(internalColorMode)}
    </Button>
  )
}

export default ColorModeToggle
