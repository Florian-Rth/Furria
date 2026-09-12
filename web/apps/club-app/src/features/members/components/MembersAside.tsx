import type { KkLetterIndexEntry } from '@furria/ui';
import { KkLetterIndex, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MembershipState } from '@/lib/api/schemas';
import { LETTER_INDEX_LABEL } from '../members-labels';
import { MembersStats } from './MembersStats';

interface MembersAsideProps {
  letters: readonly KkLetterIndexEntry[];
  letter: string | undefined;
  onLetterSelect: (letter: string) => void;
  totals: Record<MembershipState, number>;
  note: string;
}

export const MembersAside: FC<MembersAsideProps> = ({
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
    <MembersStats totals={totals} note={note} />
  </Stack>
);
