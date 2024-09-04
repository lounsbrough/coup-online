import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined.js';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined.js';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined.js';
import { Tooltip } from '@mui/material';
import { toTitleCase } from '../helpers/grammar';
import { AppColorMode, DARK_COLOR_MODE, LIGHT_COLOR_MODE, SYSTEM_COLOR_MODE, useColorModeContext } from '../context/MaterialThemeContext';

function ColorModeToggle() {
  const { internalColorMode, setColorMode } = useColorModeContext()

  const nextMap: { [colorMode in AppColorMode]: AppColorMode } = {
    [SYSTEM_COLOR_MODE]: DARK_COLOR_MODE,
    [DARK_COLOR_MODE]: LIGHT_COLOR_MODE,
    [LIGHT_COLOR_MODE]: SYSTEM_COLOR_MODE
  }

  const nextMode: AppColorMode = nextMap[internalColorMode];

  const setNewMode = () => setColorMode(nextMode);

  const iconProps = {
    onClick: setNewMode,
    sx: { cursor: 'pointer', fontSize: '36px' }
  };

  const iconMap: { [colorMode in AppColorMode]: JSX.Element } = {
    [SYSTEM_COLOR_MODE]: <SettingsBrightnessOutlinedIcon {...iconProps} />,
    [LIGHT_COLOR_MODE]: <LightModeOutlinedIcon {...iconProps} />,
    [DARK_COLOR_MODE]: <DarkModeOutlinedIcon {...iconProps} />
  };

  return (
    <Tooltip key={internalColorMode} title={toTitleCase(internalColorMode)} color="primary">
      {iconMap[internalColorMode]}
    </Tooltip>
  );
}

export default ColorModeToggle;
