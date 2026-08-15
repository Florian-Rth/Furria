import Chip from '@mui/material/Chip';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC, MouseEvent } from 'react';
import { eventsNavLabel } from '../nav-items';
import type { OriginRect } from './reveal-geometry';

interface EventsChipProps {
  onNavigate: (chip: OriginRect) => void;
}

export const EventsChip: FC<EventsChipProps> = ({ onNavigate }) => {
  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    onNavigate(event.currentTarget.getBoundingClientRect());
  };

  return (
    <Chip
      component={RouterLink}
      to="/events"
      label={eventsNavLabel}
      color="primary"
      clickable
      onClick={handleClick}
      sx={{ fontWeight: 700 }}
    />
  );
};
