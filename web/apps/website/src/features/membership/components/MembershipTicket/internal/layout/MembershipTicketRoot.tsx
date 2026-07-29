import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { MembershipTicketPerforation } from '../ui/MembershipTicketPerforation';

interface MembershipTicketRootProps extends PropsWithChildren {
  rotation: string;
  sx?: SxProps<Theme>;
}

export const MembershipTicketRoot: FC<MembershipTicketRootProps> = ({ rotation, sx, children }) => (
  <Stack
    direction="row"
    data-kk-membership-ticket
    sx={[
      {
        position: 'relative',
        bgcolor: 'warning.main',
        color: 'warning.contrastText',
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: kkTokens.shadow.raised,
        transform: rotation,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
    <MembershipTicketPerforation />
  </Stack>
);
