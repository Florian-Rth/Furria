import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const MembershipTicketObjectionRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-membership-ticket-objections
    sx={{
      flexWrap: 'wrap',
      gap: 1,
      pt: { xs: 2, desktop: 2.5 },
      borderTopWidth: kkTokens.line.section,
      borderTopStyle: 'dashed',
      borderTopColor: 'currentColor',
    }}
  >
    {children}
  </Stack>
);
