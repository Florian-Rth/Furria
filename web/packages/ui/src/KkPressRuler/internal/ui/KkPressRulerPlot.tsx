import Box from '@mui/material/Box';
import type { FC } from 'react';
import { useId } from 'react';
import type { KkPressRulerLane } from '../../press-ruler-data';
import type { RulerColumn } from '../logic/ruler-columns';
import type { LaneMetrics } from '../logic/ruler-metrics';
import { DRAFT_TRAY_OFFSET } from '../logic/ruler-metrics';
import { KkPressRulerColumn } from './KkPressRulerColumn';
import { rulerPaint } from './ruler-paint';

const HATCH_SIZE = 4;
const NOTCH_DEPTH = 3;
const DRAFT_LEAD_MS = 1080;
const DRAFT_STEP_MS = 60;
const NEEDLE_MS = 950;
const BAND_MS = 320;
const LANE_ROLL_STEP_MS = 60;
const CURSOR_PAD = 2.5;

interface KkPressRulerPlotProps {
  lane: KkPressRulerLane;
  order: number;
  width: number;
  metrics: LaneMetrics;
  columns: readonly RulerColumn[];
  today: number | null;
  draftCount: number;
  cursor: RulerColumn | null;
  delayOf: (markId: string) => number;
}

export const KkPressRulerPlot: FC<KkPressRulerPlotProps> = ({
  lane,
  order,
  width,
  metrics,
  columns,
  today,
  draftCount,
  cursor,
  delayOf,
}) => {
  const hatchId = useId();
  const { height, baseline, cellWidth, cellHeight, maxStack } = metrics;
  const xOf = (share: number): number => share * width;
  const top = lane.present ? 2 : 0;
  const summerX = xOf(lane.summerStart);
  const festX = xOf(lane.festStart);
  const roseX = xOf(lane.roseMonday);
  const bandStyle = { animationDelay: `${BAND_MS}ms` };
  const rollStyle = { animationDelay: `${order * LANE_ROLL_STEP_MS}ms` };
  const needleStyle = { animationDelay: `${NEEDLE_MS}ms` };
  const tickTop = lane.present ? 6 : 2;
  const needleWidth = lane.present ? 1.5 : 1;
  const needleDash = lane.present ? undefined : '1 2.5';
  const needleOpacity = lane.present ? 1 : 0.55;
  const basePaint = lane.present ? 'base' : 'hair';
  const baseWidth = lane.present ? 1.25 : 1;
  const openingTop = baseline - (lane.present ? 9 : 4);
  const openingWidth = lane.present ? 2 : 1;
  const summerWidth = Math.max(width - summerX, 0);
  const festWidth = Math.max(summerX - festX, 0);
  const bandHeight = baseline - top;
  const hatchFill = `url(#${hatchId})`;
  const viewBox = `0 0 ${width} ${height}`;

  const seasonTicks = lane.seasonTicks.map((share) => (
    <line
      key={share}
      x1={xOf(share)}
      x2={xOf(share)}
      y1={tickTop}
      y2={baseline}
      data-paint="hair"
      strokeWidth={1}
    />
  ));

  const summerTicks = lane.summerTicks.map((share) => (
    <circle key={share} cx={xOf(share)} cy={baseline + 2.5} r={0.9} data-paint="dot" />
  ));

  const stacks = columns.map((column) => (
    <KkPressRulerColumn key={column.x} column={column} metrics={metrics} delayOf={delayOf} />
  ));

  const todayX = today === null ? null : xOf(today);
  const needle =
    todayX === null ? null : (
      <line
        x1={todayX}
        x2={todayX}
        y1={top}
        y2={baseline + 1}
        data-paint="red-line"
        data-press="needle"
        strokeWidth={needleWidth}
        strokeDasharray={needleDash}
        strokeOpacity={needleOpacity}
        style={needleStyle}
      />
    );

  const trayX = (todayX ?? width) - DRAFT_TRAY_OFFSET;
  const drafts = lane.present
    ? Array.from({ length: Math.min(draftCount, maxStack) }, (_, level) => {
        const draftY = baseline - 1.5 - (level + 1) * (cellHeight + 1) + 1;
        const draftStyle = { animationDelay: `${DRAFT_LEAD_MS + level * DRAFT_STEP_MS}ms` };

        return (
          <rect
            key={level}
            x={trayX}
            y={draftY}
            width={cellWidth}
            height={cellHeight}
            data-paint="gold"
            data-press="cell"
            strokeWidth={1}
            strokeDasharray="1.2 0.8"
            style={draftStyle}
          />
        );
      })
    : null;

  const cursorBox =
    cursor === null ? null : (
      <rect
        x={cursor.x - cellWidth / 2 - CURSOR_PAD}
        y={top}
        width={cellWidth + CURSOR_PAD * 2}
        height={bandHeight + CURSOR_PAD}
        rx={1.5}
        fill="none"
        data-paint="red-line"
        strokeWidth={1}
      />
    );

  return (
    <Box
      component="svg"
      aria-hidden
      width={width}
      height={height}
      viewBox={viewBox}
      sx={rulerPaint}
    >
      <defs>
        <pattern
          id={hatchId}
          width={HATCH_SIZE}
          height={HATCH_SIZE}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={HATCH_SIZE} data-paint="hatch" strokeWidth={1.5} />
        </pattern>
      </defs>
      <rect
        x={summerX}
        y={top}
        width={summerWidth}
        height={bandHeight}
        fill={hatchFill}
        data-press="band"
        style={bandStyle}
      />
      <rect
        x={festX}
        y={top}
        width={festWidth}
        height={bandHeight}
        data-paint="fest"
        data-press="band"
        style={bandStyle}
      />
      {seasonTicks}
      {summerTicks}
      <line
        x1={0}
        x2={width}
        y1={baseline}
        y2={baseline}
        data-paint={basePaint}
        data-press="roll"
        strokeWidth={baseWidth}
        style={rollStyle}
      />
      <line
        x1={roseX}
        x2={roseX}
        y1={baseline}
        y2={baseline + NOTCH_DEPTH}
        data-paint="red-line"
        strokeWidth={1.5}
      />
      <line
        x1={0.75}
        x2={0.75}
        y1={openingTop}
        y2={baseline + 2}
        data-paint="red-line"
        strokeWidth={openingWidth}
      />
      {stacks}
      {needle}
      {drafts}
      {cursorBox}
    </Box>
  );
};
