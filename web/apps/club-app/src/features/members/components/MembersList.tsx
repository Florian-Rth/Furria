import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { MemberLetterSection } from '../member-filters';
import { MembersLetterSection } from './MembersLetterSection';

interface MembersListProps {
  sections: readonly MemberLetterSection[];
}

export const MembersList: FC<MembersListProps> = ({ sections }) => {
  const letterSections = sections.map((section) => (
    <MembersLetterSection key={section.letter} letter={section.letter} members={section.members} />
  ));

  return <Stack sx={{ minWidth: 0 }}>{letterSections}</Stack>;
};
