import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonLetterSection } from '../person-filters';
import { PersonsLetterSection } from './PersonsLetterSection';

interface PersonsListProps {
  sections: readonly PersonLetterSection[];
}

export const PersonsList: FC<PersonsListProps> = ({ sections }) => {
  const letterSections = sections.map((section) => (
    <PersonsLetterSection key={section.letter} letter={section.letter} persons={section.persons} />
  ));

  return <Stack sx={{ minWidth: 0 }}>{letterSections}</Stack>;
};
