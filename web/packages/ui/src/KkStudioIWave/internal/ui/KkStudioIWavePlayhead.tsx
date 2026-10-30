import Box from '@mui/material/Box';
import type { FC } from 'react';

const PERCENT = 100;

interface KkStudioIWavePlayheadProps {
  share: number | null;
}

export const KkStudioIWavePlayhead: FC<KkStudioIWavePlayheadProps> = ({ share }) => {
  const place = {
    transform: `translateX(${(share ?? 0) * PERCENT}cqw)`,
    opacity: share === null ? 0 : 1,
  };

  return (
    <Box
      aria-hidden
      data-kk-studio-i-playhead
      style={place}
      sx={(theme) => ({
        position: 'absolute',
        top: '0.25rem',
        bottom: '0.25rem',
        left: '-1px',
        width: '2px',
        borderRadius: '1px',
        pointerEvents: 'none',
        willChange: 'transform',
        backgroundColor: (theme.vars ?? theme).palette.primary.main,
      })}
    />
  );
};
