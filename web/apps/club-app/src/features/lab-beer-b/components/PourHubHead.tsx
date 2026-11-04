import { KkPourHead } from '@furria/ui/KkPourHead';
import { KkPourSpark } from '@furria/ui/KkPourSpark';
import type { FC } from 'react';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { PourHub } from '../hooks/use-pour-hub';
import {
  COUNTERS_LABEL,
  HEAD_LABEL,
  OPEN_LABEL,
  OVERDUE_LABEL,
  PEOPLE_LABEL,
  STOCK_LABEL,
  STOCK_UNIT,
  stockCaptionOf,
} from '../pour-hub-copy';

interface PourHubHeadProps {
  hub: PourHub;
}

export const PourHubHead: FC<PourHubHeadProps> = ({ hub }) => {
  const { summary, focus } = hub;
  const warn = summary.forecast.warns;
  const caption = stockCaptionOf(summary.forecast, summary.daysLeft);
  const enrolled = hub.roster.filter((row) => row.enrolled).length;
  const stockValue = String(summary.stock);
  const openValue = euroOf(summary.openCents);
  const overdueValue = String(summary.overdue);
  const peopleValue = String(enrolled);
  const openLabel = `${summary.openTabs} ${OPEN_LABEL}`;
  const openAria = `${openValue} offen auf ${openLabel}`;
  const overdueAria = `${summary.overdue} Deckel ${OVERDUE_LABEL}`;
  const peopleAria = `${enrolled} ${PEOPLE_LABEL}`;
  const spark = (
    <KkPourSpark values={summary.series} forecastSteps={summary.daysLeft} warn={warn} />
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
        warn={warn}
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
