import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkStudioStagePoint {
  key: string;
  x: number;
  y: number;
}

interface KkStudioStageOnionProps {
  points: readonly KkStudioStagePoint[];
}

export const KkStudioStageOnion: FC<KkStudioStageOnionProps> = ({ points }) => {
  const rings = points.map((point) => (
    <Box
      key={point.key}
      style={{
        transform: `translate3d(calc(${point.x * PERCENT}cqw - 50%), calc(${point.y * PERCENT}cqh - 50%), 0)`,
      }}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: { xs: '1.625rem', desktop: '2.125rem' },
        height: { xs: '1.625rem', desktop: '2.125rem' },
        borderRadius: '50%',
        border: `${kkTokens.line.hair}px dashed ${palette(theme).text.secondary}`,
        opacity: 0.7,
      })}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-studio-onion
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {rings}
    </Box>
  );
};
