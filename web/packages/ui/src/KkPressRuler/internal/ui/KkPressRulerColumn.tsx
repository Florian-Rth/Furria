import type { FC } from 'react';
import type { RulerColumn } from '../logic/ruler-columns';
import type { LaneMetrics } from '../logic/ruler-metrics';
import { KkPressRulerCell } from './KkPressRulerCell';

const CAP_LIFT = 2.5;

interface KkPressRulerColumnProps {
  column: RulerColumn;
  metrics: LaneMetrics;
  delayOf: (markId: string) => number;
}

export const KkPressRulerColumn: FC<KkPressRulerColumnProps> = ({ column, metrics, delayOf }) => {
  const { cellWidth, cellHeight, cellGap, maxStack, baseline } = metrics;
  const left = column.x - cellWidth / 2;
  const stackTopOf = (level: number): number =>
    baseline - 1.5 - (level + 1) * (cellHeight + cellGap) + cellGap;

  const cells = column.marks
    .slice(0, maxStack)
    .map((mark, level) => (
      <KkPressRulerCell
        key={mark.id}
        state={mark.state}
        x={left}
        y={stackTopOf(level)}
        width={cellWidth}
        height={cellHeight}
        delay={delayOf(mark.id)}
      />
    ));

  const capY = stackTopOf(maxStack - 1) - CAP_LIFT;
  const cap =
    column.marks.length > maxStack ? (
      <line
        x1={left - 1}
        x2={left + cellWidth + 1}
        y1={capY}
        y2={capY}
        data-paint="red-line"
        strokeWidth={1}
      />
    ) : null;

  return (
    <g>
      {cells}
      {cap}
    </g>
  );
};
