import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { pointOf } from '../logic/studio-g-lane-kinds';

export type KkStudioGRulerWeight = 'eight' | 'half' | 'count';

export interface KkStudioGRulerTick {
  seconds: number;
  weight: KkStudioGRulerWeight;
}

export interface KkStudioGRulerLabel {
  seconds: number;
  text: string;
}

const TICK_TOP: Record<KkStudioGRulerWeight, number> = { eight: 0, half: 0.45, count: 0.7 };

interface KkStudioGTimelineRulerProps {
  ticks: readonly KkStudioGRulerTick[];
  labels: readonly KkStudioGRulerLabel[];
  lengthSeconds: number;
}

export const KkStudioGTimelineRuler: FC<KkStudioGTimelineRulerProps> = ({
  ticks,
  labels,
  lengthSeconds,
}) => {
  const path = ticks.map((tick) => `M${tick.seconds} ${TICK_TOP[tick.weight]}V1`).join('');
  const texts = labels.map((label) => (
    <Typography
      key={label.seconds}
      component="span"
      variant="caption"
      style={pointOf(label.seconds)}
      sx={{
        position: 'absolute',
        top: 0,
        pl: 0.375,
        lineHeight: 1.1,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        color: 'text.secondary',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      {label.text}
    </Typography>
  ));

  return (
    <>
      <Box
        component="svg"
        aria-hidden
        viewBox={`0 0 ${Math.max(lengthSeconds, 1)} 1`}
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          color: 'text.disabled',
        }}
      >
        <Box
          component="path"
          d={path}
          vectorEffect="non-scaling-stroke"
          sx={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1 }}
        />
      </Box>
      {texts}
    </>
  );
};
