import Box from '@mui/material/Box';
import type { FC } from 'react';

interface KkStudioESegmentFillProps {
  value: number;
  current: boolean;
}

export const KkStudioESegmentFill: FC<KkStudioESegmentFillProps> = ({ value, current }) => (
  <Box
    aria-hidden
    style={{ transform: `scaleX(${value})` }}
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      transformOrigin: 'left center',
      backgroundColor: current
        ? (theme.vars ?? theme).palette.primary.main
        : (theme.vars ?? theme).palette.text.secondary,
      transition: 'background-color 200ms ease-out',
    })}
  />
);
