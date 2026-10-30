import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkStudioIStageGhost } from './KkStudioIStageOnion';

const PERCENT = 100;

interface KkStudioIStageLiveProps {
  points: readonly KkStudioIStageGhost[];
  shown: boolean;
}

export const KkStudioIStageLive: FC<KkStudioIStageLiveProps> = ({ points, shown }) => {
  const marks = points.map((point) => (
    <Box
      key={point.key}
      style={{
        transform: `translate3d(calc(${point.x * PERCENT}cqw - 50%), calc(${point.y * PERCENT}cqh - 50%), 0)`,
      }}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: '0.625rem',
        height: '0.625rem',
        borderRadius: '50%',
        willChange: 'transform',
        backgroundColor: (theme.vars ?? theme).palette.primary.main,
        boxShadow: `0 0 0 2px ${(theme.vars ?? theme).palette.background.paper}`,
      })}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-studio-i-live
      style={{ opacity: shown ? 1 : 0 }}
      sx={{ position: 'absolute', inset: 0, zIndex: 4, transition: 'opacity 200ms ease-out' }}
    >
      {marks}
    </Box>
  );
};
