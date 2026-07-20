import IconButton from '@mui/material/IconButton';
import type { FC, MouseEvent } from 'react';
import { SunMoonMorphIcon } from './SunMoonMorphIcon';
import { useModeTransition } from './use-mode-transition';

export const ThemeModeToggle: FC = () => {
  const { resolved, toggle } = useModeTransition();
  const dark = resolved === 'dark';
  const label = dark ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln';

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    toggle(event.currentTarget.getBoundingClientRect());
  };

  return (
    <IconButton aria-label={label} onClick={handleClick} sx={{ color: 'text.primary' }}>
      <SunMoonMorphIcon dark={dark} />
    </IconButton>
  );
};
