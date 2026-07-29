import Chip from '@mui/material/Chip';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC, MouseEvent } from 'react';
import type { OriginRect } from './reveal-geometry';

interface TicketsChipProps {
  onNavigate: (chip: OriginRect) => void;
}

export const TicketsChip: FC<TicketsChipProps> = ({ onNavigate }) => {
  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    onNavigate(event.currentTarget.getBoundingClientRect());
  };

  return (
    <Chip
      component={RouterLink}
      to="/tickets"
      label="Tickets"
      color="primary"
      clickable
      onClick={handleClick}
      sx={{ fontWeight: 700 }}
    />
  );
};
