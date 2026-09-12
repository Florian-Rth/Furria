import type { KkLetterIndexEntry } from '@furria/ui';
import { KkLetterIndex, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
import { LETTER_INDEX_LABEL } from '../manage-persons-labels';
import { PersonsStats } from './PersonsStats';

interface PersonsAsideProps {
  letters: readonly KkLetterIndexEntry[];
  letter: string | undefined;
  onLetterSelect: (letter: string) => void;
  totals: Record<MembershipState, number>;
  note: string;
}

export const PersonsAside: FC<PersonsAsideProps> = ({
  letters,
  letter,
  onLetterSelect,
  totals,
  note,
}) => (
  <Stack sx={{ gap: 3.5, minWidth: 0 }}>
    <KkPanel variant="block">
      <KkLetterIndex
        label={LETTER_INDEX_LABEL}
        letters={letters}
        current={letter}
        onSelect={onLetterSelect}
      />
    </KkPanel>
    <PersonsStats totals={totals} note={note} />
  </Stack>
);
