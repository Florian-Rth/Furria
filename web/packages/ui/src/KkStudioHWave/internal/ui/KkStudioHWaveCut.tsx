import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioHWaveCutProps {
  start: number;
  end: number;
}

export const KkStudioHWaveCut: FC<KkStudioHWaveCutProps> = ({ start, end }) => {
  const place = {
    left: `${Math.min(start, end) * PERCENT}%`,
    width: `${Math.abs(end - start) * PERCENT}%`,
  };

  return (
    <Box
      aria-hidden
      data-kk-studio-h-cut
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: '2.75rem',
        bottom: '2rem',
        pointerEvents: 'none',
        backgroundImage: `repeating-linear-gradient(135deg, color-mix(in srgb, ${palette(theme).warning.main} 55%, transparent) 0 2px, transparent 2px 7px)`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).warning.main} 14%, transparent)`,
      })}
    />
  );
};
