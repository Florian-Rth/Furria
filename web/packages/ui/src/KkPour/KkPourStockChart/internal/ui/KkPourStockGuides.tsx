import { useDrawingArea, useXScale, useYScale } from '@mui/x-charts/hooks';
import type { FC } from 'react';

interface KkPourStockGuidesProps {
  nowDay: number;
  marksToday: boolean;
}

export const KkPourStockGuides: FC<KkPourStockGuidesProps> = ({ nowDay, marksToday }) => {
  const area = useDrawingArea();
  const xOf = useXScale<'linear'>();
  const yOf = useYScale<'linear'>();
  const floor = yOf(0);
  const todayX = xOf(nowDay);
  const right = area.left + area.width;
  const today = marksToday ? (
    <line data-stock-today x1={todayX} x2={todayX} y1={area.top} y2={floor} />
  ) : null;

  return (
    <g data-stock-guides>
      <line data-stock-floor x1={area.left} x2={right} y1={floor} y2={floor} />
      {today}
    </g>
  );
};
