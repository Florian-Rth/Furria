import { KkPourStockBars } from '@furria/ui/KkPourStockBars';
import { KkPourStockChart } from '@furria/ui/KkPourStockChart';
import { KkPourStockCurve } from '@furria/ui/KkPourStockCurve';
import { KkPourStockRunway } from '@furria/ui/KkPourStockRunway';
import type { FC } from 'react';
import { stockChartLabelsOf } from '@/features/manage-beer-list/beer-hub-copy';
import type { StockChartLabView } from '../hooks/use-stock-chart-lab';
import type { StockChartVariant } from '../stock-chart-lab';
import { runwayLabelsOf, runwayReadoutOf } from '../stock-chart-lab';

interface StockChartLabSparkProps {
  variant: StockChartVariant;
  view: StockChartLabView;
}

export const StockChartLabSpark: FC<StockChartLabSparkProps> = ({ variant, view }) => {
  const { summary, deliveries } = view;
  const labels = stockChartLabelsOf(summary);
  const readout = runwayReadoutOf(summary);
  const runwayLabels = runwayLabelsOf(summary);

  switch (variant) {
    case 'curve':
      return (
        <KkPourStockCurve
          values={summary.series}
          forecastDays={summary.daysLeft}
          warn={summary.warns}
          labels={labels}
        />
      );
    case 'bars':
      return (
        <KkPourStockBars
          values={summary.series}
          deliveries={deliveries}
          forecastDays={summary.daysLeft}
          warn={summary.warns}
          labels={labels}
        />
      );
    case 'runway':
      return (
        <KkPourStockRunway
          values={summary.series}
          forecastDays={summary.daysLeft}
          warn={summary.warns}
          readout={readout}
          labels={runwayLabels}
        />
      );
    default:
      return (
        <KkPourStockChart
          values={summary.series}
          forecastDays={summary.daysLeft}
          warn={summary.warns}
          labels={labels}
        />
      );
  }
};
