import { KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';

interface HubSectionProps extends PropsWithChildren {
  title: string;
  meta?: string;
  action?: ReactNode;
}

export const HubSection: FC<HubSectionProps> = ({ title, meta, action, children }) => (
  <Stack sx={{ gap: 1.5, minWidth: 0 }}>
    <KkPanelHeader title={title} meta={meta} action={action} />
    {children}
  </Stack>
);
