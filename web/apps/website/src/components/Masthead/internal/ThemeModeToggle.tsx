import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';
import type { FC } from 'react';
import { resolveColorMode } from '@/lib/color-mode';
import { MoonIcon } from './MoonIcon';
import { SunIcon } from './SunIcon';

export const ThemeModeToggle: FC = () => {
  const { mode, systemMode, setMode } = useColorScheme();
  const resolved = resolveColorMode(mode, systemMode);

  const label = resolved === 'dark' ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln';

  return (
    <IconButton
      aria-label={label}
      onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')}
      sx={{ color: 'text.primary' }}
    >
      {resolved === 'dark' ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
};
