import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { contentLeftOf } from '../lane-geometry';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneTrackPlayheadProps {
  share: number;
}

export const KkLaneTrackPlayhead: FC<KkLaneTrackPlayheadProps> = ({ share }) => (
  <Box
    aria-hidden
    data-kk-lane-playhead
    style={{ left: contentLeftOf(share) }}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 0,
      zIndex: 5,
      pointerEvents: 'none',
      borderLeft: `${kkTokens.line.section}px solid ${palette(theme).primary.main}`,
      transform: 'translateX(-1px)',
      '&::before': {
        content: '""',
        position: 'sticky',
        top: 0,
        display: 'block',
        width: '0.75rem',
        height: '0.75rem',
        transform: 'translateX(calc(-50% - 1px))',
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        backgroundColor: palette(theme).primary.main,
      },
    })}
  />
);
