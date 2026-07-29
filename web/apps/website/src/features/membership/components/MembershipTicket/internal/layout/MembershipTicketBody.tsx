import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const MembershipTicketBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-membership-ticket-body
    sx={{
      flexGrow: 1,
      minWidth: 0,
      gap: { xs: 2, desktop: 2.5 },
      p: { xs: 2.5, desktop: 4 },
    }}
  >
    {children}
  </Stack>
);
