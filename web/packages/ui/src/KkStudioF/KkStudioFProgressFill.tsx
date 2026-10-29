import Box from '@mui/material/Box';
import type { FC } from 'react';

interface KkStudioFProgressFillProps {
  value: number;
}

export const KkStudioFProgressFill: FC<KkStudioFProgressFillProps> = ({ value }) => {
  const scale = `scaleX(${value})`;

  return (
    <Box
      aria-hidden
      data-kk-studio-f-fill
      style={{ transform: scale }}
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        transformOrigin: 'left center',
        backgroundColor: (theme.vars ?? theme).palette.primary.main,
        willChange: 'transform',
      })}
    />
  );
};
