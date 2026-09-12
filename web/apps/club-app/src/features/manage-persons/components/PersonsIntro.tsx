import { KkMeta, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { PERSONS_INTRO, toRegisterSentence } from '../manage-persons-labels';

interface PersonsIntroProps {
  total: number;
  action: ReactNode;
}

export const PersonsIntro: FC<PersonsIntroProps> = ({ total, action }) => (
  <Stack
    direction="row"
    sx={{ gap: 2, minWidth: 0, alignItems: 'flex-start', justifyContent: 'space-between' }}
  >
    <Stack sx={{ gap: 0.75, minWidth: 0 }}>
      <KkNote>{PERSONS_INTRO}</KkNote>
      <KkMeta>{toRegisterSentence(total)}</KkMeta>
    </Stack>
    <Stack sx={{ display: { xs: 'none', desktop: 'flex' }, flexShrink: 0 }}>{action}</Stack>
  </Stack>
);
