import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { percentOf } from '../../../KkLaneTrack/internal/lane-geometry';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneOverviewPlayheadProps {
  share: number;
}

export const KkLaneOverviewPlayhead: FC<KkLaneOverviewPlayheadProps> = ({ share }) => (
  <Box
    aria-hidden
    style={{ left: percentOf(share) }}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: kkTokens.line.section,
      transform: 'translateX(-50%)',
      backgroundColor: palette(theme).primary.main,
      pointerEvents: 'none',
      zIndex: 3,
    })}
  />
);
