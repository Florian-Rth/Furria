import Chip from '@mui/material/Chip';
import type { FC } from 'react';

interface MembershipTicketObjectionProps {
  label: string;
}

export const MembershipTicketObjection: FC<MembershipTicketObjectionProps> = ({ label }) => (
  <Chip
    label={label}
    variant="outlined"
    size="small"
    data-kk-membership-ticket-objection
    sx={{ color: 'inherit', borderColor: 'currentColor' }}
  />
);
