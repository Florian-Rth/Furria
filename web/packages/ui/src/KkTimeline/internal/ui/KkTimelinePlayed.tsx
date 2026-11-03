import Box from '@mui/material/Box';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import type { KkTimelineSpan } from '../timeline-paint';
import { spanPlaceOf, WAVE_HEIGHT, waveBottom, wavePathOf, waveTop } from '../timeline-paint';

interface KkTimelinePlayedProps {
  bars: readonly number[];
  share: number;
  span?: KkTimelineSpan;
}

export const KkTimelinePlayed: FC<KkTimelinePlayedProps> = ({ bars, share, span }) => {
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
        top: waveTop,
        bottom: waveBottom,
        pointerEvents: 'none',
      }}
    >
      <Box
        component="svg"
        viewBox={view}
        preserveAspectRatio="none"
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          fill: (theme.vars ?? theme).palette.text.primary,
        })}
      >
        <path d={path} />
      </Box>
    </Box>
  );
};
