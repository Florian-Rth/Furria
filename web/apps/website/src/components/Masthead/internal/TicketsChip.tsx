import Chip from '@mui/material/Chip';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';

interface TicketsChipProps {
  onNavigate: () => void;
}

export const TicketsChip: FC<TicketsChipProps> = ({ onNavigate }) => (
  <Chip
    component={RouterLink}
    to="/tickets"
    label="Tickets"
    color="primary"
    clickable
    onClick={onNavigate}
    sx={{ fontWeight: 700 }}
  />
);
