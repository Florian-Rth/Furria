import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const MembershipTicketHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-membership-ticket-head
    sx={{
      alignItems: 'baseline',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: { xs: 1, desktop: 2 },
    }}
  >
    {children}
  </Stack>
);
