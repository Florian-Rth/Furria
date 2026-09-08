import { KkPanel, KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface ProfilePanelProps extends PropsWithChildren {
  title: string;
}

export const ProfilePanel: FC<ProfilePanelProps> = ({ title, children }) => (
  <Stack sx={{ gap: 1.5, minWidth: 0 }}>
    <KkPanelHeader title={title} />
    <KkPanel>{children}</KkPanel>
  </Stack>
);
