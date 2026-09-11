import { KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface HubSectionProps extends PropsWithChildren {
  title: string;
  meta?: string;
}

export const HubSection: FC<HubSectionProps> = ({ title, meta, children }) => (
  <Stack sx={{ gap: 1.5, minWidth: 0 }}>
    <KkPanelHeader title={title} meta={meta} />
    {children}
  </Stack>
);
