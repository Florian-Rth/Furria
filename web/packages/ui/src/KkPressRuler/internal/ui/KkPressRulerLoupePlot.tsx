import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPressRulerLane } from '../../press-ruler-data';
import { columnsOf } from '../logic/ruler-columns';
import type { LoupeWindow } from '../logic/ruler-loupe';
import { marksInWindowOf, shareInWindowOf } from '../logic/ruler-loupe';
import { LOUPE_LANE } from '../logic/ruler-metrics';
import { KkPressRulerColumn } from './KkPressRulerColumn';
import { rulerPaint } from './ruler-paint';

const NO_DELAY = (): number => 0;
const CURSOR_HALF = 7;

interface KkPressRulerLoupePlotProps {
  lane: KkPressRulerLane;
  window: LoupeWindow;
  focus: number;
  today: number | null;
  width: number;
}

const clampShare = (share: number, window: LoupeWindow): number =>
  Math.min(Math.max((share - window.from) / (window.to - window.from), 0), 1);

export const KkPressRulerLoupePlot: FC<KkPressRulerLoupePlotProps> = ({
  lane,
  window,
  focus,
  today,
  width,
}) => {
  const { height, baseline, columnGap } = LOUPE_LANE;
  const columns = columnsOf(marksInWindowOf(lane.marks, window), width, columnGap);
  const festLeft = clampShare(lane.festStart, window) * width;
  const festRight = clampShare(lane.summerStart, window) * width;
  const todayShare = today === null ? null : shareInWindowOf(today, window);
  const focusX = (shareInWindowOf(focus, window) ?? 0.5) * width;
  const viewBox = `0 0 ${width} ${height}`;

  const stacks = columns.map((column) => (
    <KkPressRulerColumn key={column.x} column={column} metrics={LOUPE_LANE} delayOf={NO_DELAY} />
  ));

  const todayLine =
    todayShare === null ? null : (
      <line
        x1={todayShare * width}
        x2={todayShare * width}
        y1={2}
        y2={baseline}
        data-paint="red-line"
        strokeWidth={1.5}
      />
    );

  return (
    <Box component="svg" aria-hidden viewBox={viewBox} sx={[rulerPaint, { width: '100%', height }]}>
      <rect
        x={festLeft}
        y={0}
        width={Math.max(festRight - festLeft, 0)}
        height={baseline}
        data-paint="fest"
      />
      <line x1={0} x2={width} y1={baseline} y2={baseline} data-paint="base" strokeWidth={1} />
      {stacks}
      {todayLine}
      <rect
        x={focusX - CURSOR_HALF}
        y={0.5}
        width={CURSOR_HALF * 2}
        height={baseline + 4}
        rx={2}
        fill="none"
        data-paint="red-line"
        strokeWidth={1}
      />
    </Box>
  );
};
