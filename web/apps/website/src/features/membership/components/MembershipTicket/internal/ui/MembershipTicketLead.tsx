import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { membershipTicketLead } from '@/features/membership/ticket-content';

export const MembershipTicketLead: FC = () => (
  <Typography
    variant="body2"
    data-kk-membership-ticket-lead
    sx={{ fontWeight: 600, maxWidth: '34rem', textWrap: 'pretty' }}
  >
    {membershipTicketLead}
  </Typography>
);
