import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import type { KkTimelineSpan, KkTimelineWaveLane } from '../timeline-paint';
import {
  spanPlaceOf,
  WAVE_HEIGHT,
  WAVE_LANE_EDGES,
  wavePathOf,
  withinClipOf,
} from '../timeline-paint';

interface KkTimelinePlayedProps {
  bars: readonly number[];
  share: number;
  span?: KkTimelineSpan;
  lane?: KkTimelineWaveLane;
  within?: KkTimelineSpan | null;
}

const LANE_FILLS: Record<KkTimelineWaveLane, (theme: Theme) => string> = {
  wave: (theme) => (theme.vars ?? theme).palette.text.primary,
  videos: (theme) => (theme.vars ?? theme).palette.info.main,
};

export const KkTimelinePlayed: FC<KkTimelinePlayedProps> = ({
  bars,
  share,
  span,
  lane = 'wave',
  within = null,
}) => {
  const clipPath = withinClipOf(span, within);
  const path = wavePathOf(bars);
  const view = `0 0 ${Math.max(1, bars.length)} ${WAVE_HEIGHT}`;
  const clip = { clipPath: `inset(0 ${percentOf(1 - Math.min(1, Math.max(0, share)))} 0 0)` };

  return (
    <Box
      aria-hidden
      data-kk-timeline-played
      style={{ ...spanPlaceOf(span), ...clip }}
      sx={{
        position: 'absolute',
        ...WAVE_LANE_EDGES[lane],
        pointerEvents: 'none',
      }}
    >
      <Box style={{ clipPath }} sx={{ position: 'absolute', inset: 0 }}>
        <Box
          component="svg"
          viewBox={view}
          preserveAspectRatio="none"
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            fill: LANE_FILLS[lane](theme),
          })}
        >
          <path d={path} />
        </Box>
      </Box>
    </Box>
  );
};
