import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonAccessFilter } from '../person-access-filter';
import type { PersonLetterSection } from '../person-filters';
import { PersonsLetterSection } from './PersonsLetterSection';

interface PersonsListProps {
  sections: readonly PersonLetterSection[];
  access: PersonAccessFilter | null;
}

export const PersonsList: FC<PersonsListProps> = ({ sections, access }) => {
  const letterSections = sections.map((section) => (
    <PersonsLetterSection
      key={section.letter}
      letter={section.letter}
      persons={section.persons}
      access={access}
    />
  ));

  return <Stack sx={{ minWidth: 0 }}>{letterSections}</Stack>;
};
