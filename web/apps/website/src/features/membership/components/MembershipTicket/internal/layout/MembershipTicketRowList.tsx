import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const MembershipTicketRowList: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-membership-ticket-rows sx={{ gap: 0 }}>
    {children}
  </Stack>
);
