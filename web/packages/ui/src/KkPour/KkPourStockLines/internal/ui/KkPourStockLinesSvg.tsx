import type { FC } from 'react';
import type { KkPourStockLinesPlot } from '../../../pour-stock-lines';
import { lineToneOf } from './line-tones';

interface KkPourStockLinesSvgProps {
  plot: KkPourStockLinesPlot;
  keys: readonly string[];
  width: number;
  height: number;
  dot: number;
}

export const KkPourStockLinesSvg: FC<KkPourStockLinesSvgProps> = ({
  plot,
  keys,
  width,
  height,
  dot,
}) => {
  const viewBox = `0 0 ${width} ${height}`;
  const todayRule = plot.hasForecast ? (
    <line data-lines-rule x1={plot.nowX} x2={plot.nowX} y1={plot.top} y2={plot.floor} />
  ) : null;
  const lines = plot.lines.map((line, index) => {
    const tone = lineToneOf(index);
    const ahead = line.ahead === null ? null : <path data-lines-ahead d={line.ahead} />;
    const empty =
      line.empty === null ? null : (
        <circle data-lines-empty cx={line.empty.x} cy={line.empty.y} r={dot} />
      );

    return (
      <g key={keys[index]} data-line-tone={tone}>
        <path data-lines-line d={line.line} />
        {ahead}
        {empty}
        <circle data-lines-now cx={line.now.x} cy={line.now.y} r={dot} />
      </g>
    );
  });

  return (
    <svg aria-hidden="true" data-lines-svg width={width} height={height} viewBox={viewBox}>
      <line data-lines-floor x1={plot.left} x2={plot.right} y1={plot.floor} y2={plot.floor} />
      {todayRule}
      {lines}
    </svg>
  );
};
