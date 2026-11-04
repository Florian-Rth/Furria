import { KkButton } from '@furria/ui/KkButton';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BeerJournalDay } from '../beer-hub';
import { JOURNAL_EMPTY, OLDER_LABEL } from '../beer-hub-copy';
import { useDayPage } from '../hooks/use-day-page';
import { BeerJournalDaySection } from './BeerJournalDaySection';

const DAY_PAGE = 10;

interface BeerJournalProps {
  days: readonly BeerJournalDay[];
}

export const BeerJournal: FC<BeerJournalProps> = ({ days }) => {
  const { limit, hidden, showOlder } = useDayPage(days.length, DAY_PAGE);
  const older =
    hidden === 0 ? null : (
      <KkButton variant="text" onClick={showOlder}>
        {OLDER_LABEL}
      </KkButton>
    );
  const sections = days
    .slice(0, limit)
    .map((day) => <BeerJournalDaySection key={day.dayKey} day={day} />);
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
