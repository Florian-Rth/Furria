import type { FC } from 'react';
import type { KkPourStockPlot } from '../../../pour-stock-chart';

interface KkPourStockPointsProps {
  plot: KkPourStockPlot;
  radius: number;
}

export const KkPourStockPoints: FC<KkPourStockPointsProps> = ({ plot, radius }) => {
  const emptyPoint =
    plot.empty === null ? null : (
      <circle data-stock-empty cx={plot.empty.x} cy={plot.empty.y} r={radius} />
    );

  return (
    <g data-stock-points>
      {emptyPoint}
      <circle data-stock-now cx={plot.now.x} cy={plot.now.y} r={radius} />
    </g>
  );
};
