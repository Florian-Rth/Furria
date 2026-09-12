import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toWithoutMembershipSentence } from '../members-labels';

interface MembersIntroProps {
  withoutMembership: number;
}

export const MembersIntro: FC<MembersIntroProps> = ({ withoutMembership }) => {
  const sentence = toWithoutMembershipSentence(withoutMembership);

  if (sentence === null) {
    return null;
  }

  return (
    <Stack sx={{ display: { xs: 'flex', desktop: 'none' }, minWidth: 0 }}>
      <KkNote>{sentence}</KkNote>
    </Stack>
  );
};
