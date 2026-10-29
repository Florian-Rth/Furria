import Box from '@mui/material/Box';
import type { FC } from 'react';

const PERCENT = 100;

interface KkStudioAStripHeadProps {
  fraction: number;
}

export const KkStudioAStripHead: FC<KkStudioAStripHeadProps> = ({ fraction }) => (
  <Box
    aria-hidden
    data-kk-studio-a-head
    style={{ transform: `translate3d(calc(${fraction * PERCENT}cqw - 1px), 0, 0)` }}
    sx={(theme) => {
      const red = (theme.vars ?? theme).palette.primary.main;
      return {
        position: 'absolute',
        left: 0,
        top: '1.25rem',
        bottom: '-0.25rem',
        width: '2px',
        borderRadius: '1px',
        backgroundColor: red,
        pointerEvents: 'none',
        willChange: 'transform',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '0.625rem',
          height: '0.625rem',
          borderRadius: '50%',
          transform: 'translate(-50%, -30%)',
          backgroundColor: red,
          boxShadow: `0 0 0 2px ${(theme.vars ?? theme).palette.background.paper}`,
        },
      };
    }}
  />
);
