import type { FC } from 'react';
import type { KkPourStockPlot } from '../../../pour-stock-chart';
import { KkPourStockGuides } from './KkPourStockGuides';
import { KkPourStockLines } from './KkPourStockLines';
import { KkPourStockPoints } from './KkPourStockPoints';

interface KkPourStockPlotSvgProps {
  plot: KkPourStockPlot;
  width: number;
  height: number;
  fadeId: string;
  radius: number;
}

export const KkPourStockPlotSvg: FC<KkPourStockPlotSvgProps> = ({
  plot,
  width,
  height,
  fadeId,
  radius,
}) => {
  const viewBox = `0 0 ${width} ${height}`;

  return (
    <svg aria-hidden="true" data-stock-svg width={width} height={height} viewBox={viewBox}>
      <KkPourStockGuides plot={plot} />
      <KkPourStockLines plot={plot} fadeId={fadeId} />
      <KkPourStockPoints plot={plot} radius={radius} />
    </svg>
  );
};
