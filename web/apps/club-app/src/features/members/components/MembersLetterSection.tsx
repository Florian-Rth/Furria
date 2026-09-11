import { KkLetterDivider } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toLetterAnchorId } from '../members-labels';
import type { MemberSummary } from '../schemas';
import { MemberRow } from './MemberRow';

interface MembersLetterSectionProps {
  letter: string;
  members: readonly MemberSummary[];
}

export const MembersLetterSection: FC<MembersLetterSectionProps> = ({ letter, members }) => {
  const anchorId = toLetterAnchorId(letter);
  const rows = members.map((member) => <MemberRow key={member.personId} member={member} />);

  return (
    <Stack sx={{ minWidth: 0 }}>
      <KkLetterDivider letter={letter} id={anchorId} ground="page" />
      {rows}
    </Stack>
  );
};
