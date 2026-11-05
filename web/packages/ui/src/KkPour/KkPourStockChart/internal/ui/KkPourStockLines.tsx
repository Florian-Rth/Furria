import type { FC } from 'react';
import type { KkPourStockPlot } from '../../../pour-stock-chart';

interface KkPourStockLinesProps {
  plot: KkPourStockPlot;
  fadeId: string;
}

export const KkPourStockLines: FC<KkPourStockLinesProps> = ({ plot, fadeId }) => {
  const fill = `url(#${fadeId})`;
  const forecast = plot.forecast === null ? null : <path data-stock-ahead d={plot.forecast} />;

  return (
    <g data-stock-lines>
      <defs>
        <linearGradient id={fadeId} data-stock-fade x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" />
          <stop offset="1" />
        </linearGradient>
      </defs>
      <path data-stock-area d={plot.area} fill={fill} />
      <path data-stock-history d={plot.line} />
      {forecast}
    </g>
  );
};
