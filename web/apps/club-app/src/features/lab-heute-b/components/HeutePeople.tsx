import { KkChip } from '@furria/ui/KkChip';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LiveLine } from '@/features/live/schemas';
import { MISSING_TITLE, NOBODY_MISSING, STANDS_IN_TITLE, toPersonName } from '../heute-b-copy';
import { missingOf, standInsOf } from '../heute-board';

interface HeutePeopleProps {
  line: LiveLine;
}

export const HeutePeople: FC<HeutePeopleProps> = ({ line }) => {
  const missing = missingOf(line).map((person) => {
    const name = toPersonName(person.firstName, person.lastName);

    return (
      <KkChip key={`m:${person.personId}`} tone="gold" size="small">
        {MISSING_TITLE}: {name}
      </KkChip>
    );
  });
  const standIns = standInsOf(line).map((person) => {
    const name = toPersonName(person.firstName, person.lastName);

    return (
      <KkChip key={`s:${person.personId}`} tone="green" size="small">
        {STANDS_IN_TITLE}: {name}
      </KkChip>
    );
  });

  if (missing.length === 0 && standIns.length === 0) {
    return line.cast.length === 0 ? null : <KkMeta>{NOBODY_MISSING}</KkMeta>;
  }

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, minWidth: 0 }}>
      {missing}
      {standIns}
    </Stack>
  );
};
