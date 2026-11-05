import { KkPourHead } from '@furria/ui/KkPourHead';
import { KkPourSpark } from '@furria/ui/KkPourSpark';
import type { FC } from 'react';
import type { BeerHubSummary } from '../beer-hub';
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
} from '../beer-hub-copy';

interface BeerHubHeadProps {
  summary: BeerHubSummary;
}

export const BeerHubHead: FC<BeerHubHeadProps> = ({ summary }) => {
  const caption = stockCaptionOf(summary);
  const stockValue = String(summary.stock);
  const openValue = tileEuroOf(summary.openCents);
  const overdueValue = String(summary.overdue);
  const peopleValue = String(summary.enrolled);
  const openLabel = openTabsLabelOf(summary.openTabs);
  const overdueAttention = summary.overdue > 0;
  const spark = (
    <KkPourSpark values={summary.series} forecastSteps={summary.daysLeft} warn={summary.warns} />
  );

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
