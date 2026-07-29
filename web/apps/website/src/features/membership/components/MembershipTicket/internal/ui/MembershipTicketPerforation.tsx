import Box from '@mui/material/Box';
import type { FC } from 'react';
import {
  buildPerforationBackgroundSize,
  buildPerforationGradient,
  membershipTicketNotchRadius,
  membershipTicketNotchStep,
  membershipTicketStubWidth,
} from '@/features/membership/ticket-shape';

export const MembershipTicketPerforation: FC = () => (
  <Box
    aria-hidden
    data-kk-membership-ticket-perforation
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: {
        xs: theme.spacing(membershipTicketStubWidth.xs),
        desktop: theme.spacing(membershipTicketStubWidth.desktop),
      },
      width: theme.spacing(membershipTicketNotchRadius * 2),
      transform: 'translateX(50%)',
      backgroundImage: buildPerforationGradient(
        (theme.vars ?? theme).palette.background.default,
        theme.spacing(membershipTicketNotchRadius),
      ),
      backgroundSize: buildPerforationBackgroundSize(theme.spacing(membershipTicketNotchStep)),
      backgroundRepeat: 'repeat-y',
      pointerEvents: 'none',
      zIndex: 1,
    })}
  />
);
