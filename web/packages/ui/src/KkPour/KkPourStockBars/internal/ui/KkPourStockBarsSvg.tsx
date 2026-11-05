import type { FC } from 'react';
import type { KkPourStockBarsPlot } from '../../../pour-stock-bars';
import { barPathOf } from '../../../pour-stock-bars';

interface KkPourStockBarsSvgProps {
  plot: KkPourStockBarsPlot;
  width: number;
  height: number;
  dot: number;
}

export const KkPourStockBarsSvg: FC<KkPourStockBarsSvgProps> = ({ plot, width, height, dot }) => {
  const viewBox = `0 0 ${width} ${height}`;
  const bars = plot.bars.map((bar) => {
    const path = barPathOf(bar);

    return <path key={bar.day} data-bar={bar.kind} d={path} />;
  });
  const emptyY = plot.floor - dot;
  const empty =
    plot.endX === null ? null : <circle data-bars-empty cx={plot.endX} cy={emptyY} r={dot} />;

  return (
    <svg aria-hidden="true" data-bars-svg width={width} height={height} viewBox={viewBox}>
      {bars}
      {empty}
    </svg>
  );
};
