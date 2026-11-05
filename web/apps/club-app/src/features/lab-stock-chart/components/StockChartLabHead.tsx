import { KkPourHead } from '@furria/ui/KkPourHead';
import type { FC } from 'react';
import {
  COUNTERS_LABEL,
  HEAD_LABEL,
  OVERDUE_LABEL,
  openTabsLabelOf,
  PEOPLE_LABEL,
  STOCK_LABEL,
  STOCK_UNIT,
  stockCaptionOf,
  tileEuroOf,
} from '@/features/manage-beer-list/beer-hub-copy';
import type { StockChartLabView } from '../hooks/use-stock-chart-lab';
import type { StockChartVariant } from '../stock-chart-lab';
import { StockChartLabSpark } from './StockChartLabSpark';

interface StockChartLabHeadProps {
  variant: StockChartVariant;
  view: StockChartLabView;
}

export const StockChartLabHead: FC<StockChartLabHeadProps> = ({ variant, view }) => {
  const { summary } = view;
  const caption = stockCaptionOf(summary);
  const stockValue = String(summary.stock);
  const openValue = tileEuroOf(summary.openCents);
  const overdueValue = String(summary.overdue);
  const peopleValue = String(summary.enrolled);
  const openLabel = openTabsLabelOf(summary.openTabs);
  const overdueAttention = summary.overdue > 0;
  const spark = <StockChartLabSpark variant={variant} view={view} />;

  return (
    <KkPourHead label={HEAD_LABEL}>
      <KkPourHead.Stock
        label={STOCK_LABEL}
        value={stockValue}
        unit={STOCK_UNIT}
        caption={caption}
        warn={summary.warns}
        spark={spark}
      />
      <KkPourHead.Counters label={COUNTERS_LABEL}>
        <KkPourHead.Counter value={openValue} label={openLabel} attention={false} />
        <KkPourHead.Counter
          value={overdueValue}
          label={OVERDUE_LABEL}
          attention={overdueAttention}
        />
        <KkPourHead.Counter value={peopleValue} label={PEOPLE_LABEL} attention={false} />
      </KkPourHead.Counters>
    </KkPourHead>
  );
};
