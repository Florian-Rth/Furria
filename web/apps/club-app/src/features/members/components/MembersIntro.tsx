import { KkMeta, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toConnectedSentence, toWithoutMembershipSentence } from '../members-labels';

interface MembersIntroProps {
  total: number;
  withoutMembership: number;
}

export const MembersIntro: FC<MembersIntroProps> = ({ total, withoutMembership }) => {
  const withoutMembershipSentence = toWithoutMembershipSentence(withoutMembership);
  const secondLine =
    withoutMembershipSentence === null ? null : <KkMeta>{withoutMembershipSentence}</KkMeta>;

  return (
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      <KkNote>{toConnectedSentence(total)}</KkNote>
      {secondLine}
    </Stack>
  );
};
