import { KkPanel, KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppUserLink } from '@/features/session';
import { MORE_PANEL_TITLES } from '../more-labels';

export const MoreProfilePanel: FC = () => (
  <Stack sx={{ gap: 1.5, minWidth: 0 }}>
    <KkPanelHeader title={MORE_PANEL_TITLES.profile} />
    <KkPanel>
      <AppUserLink />
    </KkPanel>
  </Stack>
);
