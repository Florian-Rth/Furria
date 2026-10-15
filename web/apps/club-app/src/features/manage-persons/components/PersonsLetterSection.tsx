import { KkLetterDivider } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toLetterAnchorId } from '../letter-anchors';
import type { PersonSummary } from '../schemas';
import { PersonRow } from './PersonRow';

interface PersonsLetterSectionProps {
  letter: string;
  persons: readonly PersonSummary[];
}

export const PersonsLetterSection: FC<PersonsLetterSectionProps> = ({ letter, persons }) => {
  const anchorId = toLetterAnchorId(letter);
  const rows = persons.map((person) => <PersonRow key={person.personId} person={person} />);

  return (
    <Stack sx={{ minWidth: 0 }}>
      <KkLetterDivider letter={letter} id={anchorId} ground="page" />
      {rows}
    </Stack>
  );
};
