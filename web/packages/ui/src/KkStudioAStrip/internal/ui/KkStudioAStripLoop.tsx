import Box from '@mui/material/Box';
import type { FC } from 'react';

const PERCENT = 100;

interface KkStudioAStripLoopProps {
  from: number;
  to: number;
}

export const KkStudioAStripLoop: FC<KkStudioAStripLoopProps> = ({ from, to }) => (
  <Box
    aria-hidden
    data-kk-studio-a-loop
    style={{ left: `${from * PERCENT}%`, width: `${(to - from) * PERCENT}%` }}
    sx={(theme) => {
      const red = (theme.vars ?? theme).palette.primary.main;
      return {
        position: 'absolute',
        top: '-0.125rem',
        bottom: '-0.125rem',
        borderRadius: '3px',
        backgroundColor: `color-mix(in srgb, ${red} 14%, transparent)`,
        borderLeft: `2px solid ${red}`,
        borderRight: `2px solid ${red}`,
        pointerEvents: 'none',
      };
    }}
  />
);
