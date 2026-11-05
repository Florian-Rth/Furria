import { useXScale, useYScale } from '@mui/x-charts/hooks';
import type { FC } from 'react';
import type { KkPourStockPoint } from '../../../pour-stock-chart';

interface KkPourStockPointsProps {
  now: KkPourStockPoint;
  empty: KkPourStockPoint | null;
  radius: number;
}

export const KkPourStockPoints: FC<KkPourStockPointsProps> = ({ now, empty, radius }) => {
  const xOf = useXScale<'linear'>();
  const yOf = useYScale<'linear'>();
  const emptyPoint =
    empty === null ? null : (
      <circle data-stock-empty cx={xOf(empty.day)} cy={yOf(empty.stock)} r={radius} />
    );

  return (
    <g data-stock-points>
      {emptyPoint}
      <circle data-stock-now cx={xOf(now.day)} cy={yOf(now.stock)} r={radius} />
    </g>
  );
};
