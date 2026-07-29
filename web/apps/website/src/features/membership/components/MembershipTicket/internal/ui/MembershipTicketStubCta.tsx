import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { membershipTicketStubLabel } from '@/features/membership/ticket-content';

export const MembershipTicketStubCta: FC = () => (
  <Typography
    component="span"
    variant="overline"
    data-kk-membership-ticket-stub-cta
    sx={{ ...kkTokens.eyebrow, writingMode: 'vertical-rl', whiteSpace: 'nowrap' }}
  >
    {membershipTicketStubLabel}
  </Typography>
);
