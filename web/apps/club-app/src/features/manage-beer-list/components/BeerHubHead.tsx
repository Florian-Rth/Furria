import { KkPourHead } from '@furria/ui/KkPourHead';
import { KkPourSpark } from '@furria/ui/KkPourSpark';
import type { FC } from 'react';
import type { BeerHubSummary } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import {
  COUNTERS_LABEL,
  euroOf,
  HEAD_LABEL,
  OPEN_LABEL,
  OVERDUE_LABEL,
  PEOPLE_LABEL,
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
  const caption = stockCaptionOf(summary.emptyOn, summary.daysLeft, summary.warns);
  const stockValue = String(summary.stock);
  const openValue = euroOf(summary.openCents);
  const overdueValue = String(summary.overdue);
  const peopleValue = String(summary.enrolled);
  const openLabel = `${summary.openTabs} ${OPEN_LABEL}`;
  const openAria = `${openValue} offen auf ${openLabel}`;
  const overdueAria = `${summary.overdue} Deckel ${OVERDUE_LABEL}`;
  const peopleAria = `${summary.enrolled} ${PEOPLE_LABEL}`;
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
        selected={focus === 'stock'}
        onSelect={chooseStock}
      />
      <KkPourHead.Counters label={COUNTERS_LABEL}>
        <KkPourHead.Counter
          value={openValue}
          label={openLabel}
          ariaLabel={openAria}
          attention={false}
          selected={focus === 'open'}
          onSelect={chooseOpen}
        />
        <KkPourHead.Counter
          value={overdueValue}
          label={OVERDUE_LABEL}
          ariaLabel={overdueAria}
          attention={summary.overdue > 0}
          selected={focus === 'overdue'}
          onSelect={chooseOverdue}
        />
        <KkPourHead.Counter
          value={peopleValue}
          label={PEOPLE_LABEL}
          ariaLabel={peopleAria}
          attention={false}
          selected={focus === 'people'}
          onSelect={choosePeople}
        />
      </KkPourHead.Counters>
    </KkPourHead>
  );
};
