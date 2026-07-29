import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { membershipTicketHeadline } from '@/features/membership/ticket-content';

export const MembershipTicketHeadline: FC = () => (
  <Typography variant="h3" component="p" data-kk-membership-ticket-headline sx={{ lineHeight: 1 }}>
    {membershipTicketHeadline}
  </Typography>
);
