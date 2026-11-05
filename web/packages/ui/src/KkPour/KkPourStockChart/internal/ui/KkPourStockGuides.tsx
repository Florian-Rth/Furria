import type { FC } from 'react';
import type { KkPourStockPlot } from '../../../pour-stock-chart';

interface KkPourStockGuidesProps {
  plot: KkPourStockPlot;
}

export const KkPourStockGuides: FC<KkPourStockGuidesProps> = ({ plot }) => {
  const today =
    plot.todayRule === null ? null : (
      <line
        data-stock-today
        x1={plot.todayRule}
        x2={plot.todayRule}
        y1={plot.top}
        y2={plot.floor}
      />
    );

  return (
    <g data-stock-guides>
      <line data-stock-floor x1={plot.left} x2={plot.right} y1={plot.floor} y2={plot.floor} />
      {today}
    </g>
  );
};
