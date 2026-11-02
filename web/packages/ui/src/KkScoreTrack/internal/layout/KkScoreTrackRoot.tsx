import Box from '@mui/material/Box';
import type { FC, MouseEvent, PropsWithChildren } from 'react';
import { raisedSurface } from '../../../internal/raised-surface';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkScoreTrackSize } from '../score-paint';
import { LANE_VARS, percentOf, SCORE_LANES } from '../score-paint';

export interface KkScoreZoom {
  start: number;
  end: number;
}

const ZOOM_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

interface KkScoreTrackRootProps extends PropsWithChildren {
  label: string;
  size: KkScoreTrackSize;
  zoom: KkScoreZoom;
  onSeek: (share: number) => void;
  sx?: KkSx;
}

export const KkScoreTrackRoot: FC<KkScoreTrackRootProps> = ({
  label,
  size,
  zoom,
  onSeek,
  sx,
  children,
}) => {
  const lanes = SCORE_LANES[size];
  const span = Math.max(zoom.end - zoom.start, Number.EPSILON);
  const canvas = { left: percentOf(-zoom.start / span), width: percentOf(1 / span) };
  const seek = (event: MouseEvent<HTMLDivElement>): void => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width > 0) {
      onSeek(Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)));
    }
  };

  return (
    <Box
      role="group"
      aria-label={label}
      data-kk-score-track={size}
      sx={[
        (theme) => ({
          [LANE_VARS.ruler]: lanes.ruler,
          [LANE_VARS.parts]: lanes.parts,
          [LANE_VARS.steps]: lanes.steps,
          position: 'relative',
          height: lanes.height,
          minWidth: 0,
          borderRadius: `${kkTokens.radius.base}px`,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          overflow: 'clip',
          ...raisedSurface(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        data-kk-score-canvas
        onClick={seek}
        style={canvas}
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          cursor: 'text',
          transition: `left 360ms ${ZOOM_EASE}, width 360ms ${ZOOM_EASE}`,
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
