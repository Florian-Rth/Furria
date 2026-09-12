import type { KkLetterIndexEntry } from '@furria/ui';
import { KkLetterIndex } from '@furria/ui';
import type { FC } from 'react';
import { LETTER_INDEX_LABEL } from '../manage-persons-labels';

interface PersonsLetterRailProps {
  letters: readonly KkLetterIndexEntry[];
  letter: string | undefined;
  onLetterSelect: (letter: string) => void;
}

export const PersonsLetterRail: FC<PersonsLetterRailProps> = ({
  letters,
  letter,
  onLetterSelect,
}) => (
  <KkLetterIndex
    variant="rail"
    label={LETTER_INDEX_LABEL}
    letters={letters}
    current={letter}
    onSelect={onLetterSelect}
  />
);
