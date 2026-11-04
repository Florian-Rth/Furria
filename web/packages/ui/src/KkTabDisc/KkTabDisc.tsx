import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkConfettiBurst } from '../KkConfettiBurst';
import { stepFigures } from '../KkStatePill/state-paint';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkTabStrokeMarks } from './internal/KkTabStrokeMarks';
import { tabStrokePaint } from './internal/tab-stroke-paint';
import type { KkTabStrokeState } from './tab-strokes';
import { TAB_DISC_CAPACITY, TAB_DISC_VIEW, tabDiscMarksOf } from './tab-strokes';

export type KkTabDiscSize = 'small' | 'medium' | 'large';

const CENTER = TAB_DISC_VIEW / 2;
const EDGE_RADIUS = 58;
const CRIMP_INNER = 54.6;
const CRIMP_OUTER = 57;
const CRIMP_COUNT = 72;
const PRINT_RADIUS = 51.5;
const PRINT_INNER_RADIUS = 49.5;
const STROKE_WIDTH = 3.1;
const BURST_PIECES = 26;

const EXTENTS: Record<KkTabDiscSize, string> = {
  small: '4.5rem',
  medium: '8.25rem',
  large: 'min(64vw, 15.5rem)',
};

const CRIMPS = Array.from({ length: CRIMP_COUNT }, (_, index) => {
  const angle = (index / CRIMP_COUNT) * Math.PI * 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    id: index,
    x1: CENTER + cos * CRIMP_INNER,
    y1: CENTER + sin * CRIMP_INNER,
    x2: CENTER + cos * CRIMP_OUTER,
    y2: CENTER + sin * CRIMP_OUTER,
  };
});

const discPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    display: 'block',
    width: '100%',
    height: '100%',
    overflow: 'visible',
    '& [data-tab-disc-face]': { fill: palette.background.paper, stroke: palette.divider },
    '& [data-tab-disc-crimp]': { stroke: palette.divider },
    '& [data-tab-disc-print]': { fill: 'none', stroke: palette.divider },
    ...tabStrokePaint(theme),
  };
};

interface KkTabDiscProps {
  strokes: readonly KkTabStrokeState[];
  label: string;
  size?: KkTabDiscSize;
  drawKey?: number;
  burstKey?: number;
  sx?: KkSx;
}

export const KkTabDisc: FC<KkTabDiscProps> = ({
  strokes,
  label,
  size = 'medium',
  drawKey = 0,
  burstKey = 0,
  sx,
}) => {
  const visible = strokes.slice(-TAB_DISC_CAPACITY);
  const hidden = strokes.length - visible.length;
  const layout = tabDiscMarksOf(visible.length);
  const crimps = CRIMPS.map((crimp) => (
    <line
      key={crimp.id}
      data-tab-disc-crimp
      x1={crimp.x1}
      y1={crimp.y1}
      x2={crimp.x2}
      y2={crimp.y2}
      strokeWidth={0.9}
    />
  ));
  const more =
    hidden === 0 ? null : (
      <Box
        component="span"
        aria-hidden
        sx={{
          ...stepFigures,
          position: 'absolute',
          left: '50%',
          bottom: '11%',
          transform: 'translateX(-50%)',
          typography: 'caption',
          fontWeight: 800,
          lineHeight: 1,
          color: 'text.secondary',
        }}
      >
        {`+${hidden}`}
      </Box>
    );

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-tab-disc
      sx={[
        {
          position: 'relative',
          flexShrink: 0,
          width: EXTENTS[size],
          height: EXTENTS[size],
          borderRadius: '50%',
          boxShadow: kkTokens.shadow.rest,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="svg"
        aria-hidden
        viewBox={`0 0 ${TAB_DISC_VIEW} ${TAB_DISC_VIEW}`}
        sx={discPaint}
      >
        <circle data-tab-disc-face cx={CENTER} cy={CENTER} r={EDGE_RADIUS} strokeWidth={1} />
        {crimps}
        <circle data-tab-disc-print cx={CENTER} cy={CENTER} r={PRINT_RADIUS} strokeWidth={0.9} />
        <circle
          data-tab-disc-print
          cx={CENTER}
          cy={CENTER}
          r={PRINT_INNER_RADIUS}
          strokeWidth={0.5}
        />
        <KkTabStrokeMarks
          key={drawKey}
          marks={layout.marks}
          states={visible}
          offset={0}
          width={STROKE_WIDTH}
        />
      </Box>
      {more}
      <KkConfettiBurst fireKey={burstKey} count={BURST_PIECES} alwaysPlays />
    </Box>
  );
};
