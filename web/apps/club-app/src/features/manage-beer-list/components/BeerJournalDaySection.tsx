import { KkPourDay } from '@furria/ui/KkPourDay';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerJournalDay } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { dayFactsOf, dayLabelOf } from '../beer-hub-copy';
import { dayNameOf } from '../beer-time';
import { BeerJournalLine } from './BeerJournalLine';

interface BeerJournalDaySectionProps {
  day: BeerJournalDay;
}

export const BeerJournalDaySection: FC<BeerJournalDaySectionProps> = ({ day }) => {
  const { todayKey } = useBeerHubContext();
  const label = dayLabelOf(dayNameOf(day.dayKey, todayKey), day.dayKey);
  const facts = dayFactsOf(day.entries);
  const lines = day.entries.map((entry) => <BeerJournalLine key={entry.key} entry={entry} />);

  return (
    <Stack component="section">
      <KkPourDay label={label} facts={facts} />
      {lines}
    </Stack>
  );
};
