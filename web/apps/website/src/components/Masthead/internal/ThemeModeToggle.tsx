import { KkSunMoonMorphIcon } from '@furria/ui/KkSunMoonMorphIcon';
import { useKkModeTransition } from '@furria/ui/use-kk-mode-transition';
import IconButton from '@mui/material/IconButton';
import type { FC, MouseEvent } from 'react';

export const ThemeModeToggle: FC = () => {
  const { resolved, toggle } = useKkModeTransition();
  const dark = resolved === 'dark';
  const label = dark ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln';

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    toggle(event.currentTarget.getBoundingClientRect());
  };

  return (
    <IconButton aria-label={label} onClick={handleClick} sx={{ color: 'text.primary' }}>
      <KkSunMoonMorphIcon scheme={resolved} />
    </IconButton>
  );
};
