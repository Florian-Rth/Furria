import { KkPourHead } from '@furria/ui/KkPourHead';
import { KkPourSpark } from '@furria/ui/KkPourSpark';
import type { FC } from 'react';
import type { BeerHubSummary } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import {
  COUNTERS_LABEL,
  euroOf,
  HEAD_LABEL,
  OVERDUE_LABEL,
  openAriaOf,
  openTabsLabelOf,
  overdueAriaOf,
  PEOPLE_LABEL,
  peopleAriaOf,
  STOCK_LABEL,
  STOCK_UNIT,
  stockCaptionOf,
} from '../beer-hub-copy';

interface BeerHubHeadProps {
  summary: BeerHubSummary;
}

export const BeerHubHead: FC<BeerHubHeadProps> = ({ summary }) => {
  const hub = useBeerHubContext();
  const { focus } = hub;
  const caption = stockCaptionOf(summary);
  const stockValue = String(summary.stock);
  const openValue = euroOf(summary.openCents);
  const overdueValue = String(summary.overdue);
  const peopleValue = String(summary.enrolled);
  const openLabel = openTabsLabelOf(summary.openTabs);
  const openAria = openAriaOf(summary);
  const overdueAria = overdueAriaOf(summary.overdue);
  const peopleAria = peopleAriaOf(summary.enrolled);
  const overdueAttention = summary.overdue > 0;
  const stockSelected = focus === 'stock';
  const openSelected = focus === 'open';
  const overdueSelected = focus === 'overdue';
  const peopleSelected = focus === 'people';
  const spark = (
    <KkPourSpark values={summary.series} forecastSteps={summary.daysLeft} warn={summary.warns} />
  );
  const chooseStock = (): void => {
    hub.chooseFocus('stock');
  };
  const chooseOpen = (): void => {
    hub.chooseFocus('open');
  };
  const chooseOverdue = (): void => {
    hub.chooseFocus('overdue');
  };
  const choosePeople = (): void => {
    hub.chooseFocus('people');
  };

  return (
    <KkPourHead label={HEAD_LABEL}>
      <KkPourHead.Stock
        label={STOCK_LABEL}
        value={stockValue}
        unit={STOCK_UNIT}
        caption={caption}
        warn={summary.warns}
        spark={spark}
        selected={stockSelected}
        onSelect={chooseStock}
      />
      <KkPourHead.Counters label={COUNTERS_LABEL}>
        <KkPourHead.Counter
          value={openValue}
          label={openLabel}
          ariaLabel={openAria}
          attention={false}
          selected={openSelected}
          onSelect={chooseOpen}
        />
        <KkPourHead.Counter
          value={overdueValue}
          label={OVERDUE_LABEL}
          ariaLabel={overdueAria}
          attention={overdueAttention}
          selected={overdueSelected}
          onSelect={chooseOverdue}
        />
        <KkPourHead.Counter
          value={peopleValue}
          label={PEOPLE_LABEL}
          ariaLabel={peopleAria}
          attention={false}
          selected={peopleSelected}
          onSelect={choosePeople}
        />
      </KkPourHead.Counters>
    </KkPourHead>
  );
};
