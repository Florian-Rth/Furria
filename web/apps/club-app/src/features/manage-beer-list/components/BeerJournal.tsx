import { KkButton } from '@furria/ui/KkButton';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerJournalDay } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { dayFactsOf, dayLabelOf, JOURNAL_EMPTY, OLDER_LABEL } from '../beer-hub-copy';
import { dayNameOf } from '../beer-time';
import { useDayPage } from '../hooks/use-day-page';
import { BeerJournalLine } from './BeerJournalLine';

const DAY_PAGE = 10;

interface BeerJournalProps {
  days: readonly BeerJournalDay[];
}

export const BeerJournal: FC<BeerJournalProps> = ({ days }) => {
  const { todayKey } = useBeerHubContext();
  const { limit, hidden, showOlder } = useDayPage(days.length, DAY_PAGE);
  const older =
    hidden === 0 ? null : (
      <KkButton variant="text" onClick={showOlder}>
        {OLDER_LABEL}
      </KkButton>
    );
  const sections = days.slice(0, limit).map((day) => {
    const label = dayLabelOf(dayNameOf(day.dayKey, todayKey), day.dayKey);
    const facts = dayFactsOf(day.entries);
    const lines = day.entries.map((entry) => <BeerJournalLine key={entry.key} entry={entry} />);

    return (
      <Stack key={day.dayKey} component="section">
        <KkPourDay label={label} facts={facts} />
        {lines}
      </Stack>
    );
  });
  const empty =
    days.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {JOURNAL_EMPTY}
      </KkText>
    ) : null;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      {empty}
      {sections}
      {older}
    </Stack>
  );
};
