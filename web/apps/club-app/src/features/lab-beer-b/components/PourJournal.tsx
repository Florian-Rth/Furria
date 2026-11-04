import { KkButton } from '@furria/ui/KkButton';
import { KkPourDay } from '@furria/ui/KkPourDay';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePourDayPage } from '../hooks/use-pour-day-page';
import { cratesLabel, dayLabelOf } from '../pour-copy';
import { JOURNAL_EMPTY } from '../pour-hub-copy';
import type { PourJournalDay } from '../pour-journal';
import { olderLabelOf } from '../pour-member-copy';
import { dayNameOf } from '../pour-time';
import { PourJournalLine } from './PourJournalLine';

const DAY_PAGE = 10;

interface PourJournalProps {
  days: readonly PourJournalDay[];
  todayKey: string;
  selectedId: number | null;
  onOpen: (personId: number) => void;
}

const dayFactsOf = (day: PourJournalDay): string => {
  const crates = day.entries
    .filter((entry) => entry.kind === 'crate' && !entry.undone)
    .reduce((sum, entry) => sum + entry.count, 0);

  return crates === 0 ? '' : `${cratesLabel(crates)} gebucht`;
};

export const PourJournal: FC<PourJournalProps> = ({ days, todayKey, selectedId, onOpen }) => {
  const { limit, hidden, showOlder } = usePourDayPage(days.length, DAY_PAGE);
  const olderLabel = olderLabelOf(hidden);
  const older =
    hidden === 0 ? null : (
      <KkButton variant="text" onClick={showOlder}>
        {olderLabel}
      </KkButton>
    );
  const sections = days.slice(0, limit).map((day) => {
    const label = dayLabelOf(dayNameOf(day.dayKey, todayKey), day.dayKey);
    const facts = dayFactsOf(day);
    const lines = day.entries.map((entry) => (
      <PourJournalLine key={entry.key} entry={entry} selectedId={selectedId} onOpen={onOpen} />
    ));

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
