import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { membershipTicketStubMark } from '@/features/membership/ticket-content';

export const MembershipTicketStubMark: FC = () => (
  <Typography
    aria-hidden
    component="span"
    variant="h4"
    data-kk-membership-ticket-mark
    sx={{ writingMode: 'vertical-rl', letterSpacing: '0.14em', lineHeight: 1 }}
  >
    {membershipTicketStubMark}
  </Typography>
);
