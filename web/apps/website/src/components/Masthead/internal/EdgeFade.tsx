import Box from '@mui/material/Box';
import type { FC } from 'react';

interface EdgeFadeProps {
  side: 'left' | 'right';
  visible: boolean;
}

export const EdgeFade: FC<EdgeFadeProps> = ({ side, visible }) => (
  <Box
    aria-hidden
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      [side]: 0,
      width: theme.spacing(5),
      pointerEvents: 'none',
      background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, ${
        (theme.vars ?? theme).palette.background.default
      }, transparent)`,
      opacity: visible ? 1 : 0,
      transition: theme.transitions.create('opacity', {
        duration: theme.transitions.duration.shorter,
      }),
    })}
  />
);
