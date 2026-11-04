import { KkPourDay } from '@furria/ui/KkPourDay';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { dayLabelOf } from '../pour-copy';
import { dayFactsOf } from '../pour-member-copy';
import type { PourDay } from '../pour-stream';
import { dayNameOf } from '../pour-time';
import { PourStreamEntry } from './PourStreamEntry';

interface PourStreamDayProps {
  day: PourDay;
  todayKey: string;
  owner: string;
  freshIds: ReadonlySet<number>;
}

export const PourStreamDay: FC<PourStreamDayProps> = ({ day, todayKey, owner, freshIds }) => {
  const label = dayLabelOf(dayNameOf(day.dayKey, todayKey), day.dayKey);
  const facts = dayFactsOf(day.crateCount);
  const entries = day.entries.map((entry) => (
    <PourStreamEntry key={entry.key} entry={entry} owner={owner} freshIds={freshIds} />
  ));

  return (
    <Stack component="section" sx={{ gap: 0.25 }}>
      <KkPourDay label={label} facts={facts} />
      {entries}
    </Stack>
  );
};
