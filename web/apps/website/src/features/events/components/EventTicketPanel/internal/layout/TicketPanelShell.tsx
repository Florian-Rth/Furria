import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const TicketPanelShell: FC<PropsWithChildren> = ({ children }) => (
  <Card data-kk-ticket-panel sx={{ p: { xs: 3, md: 4 } }}>
    <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>{children}</Stack>
  </Card>
);
