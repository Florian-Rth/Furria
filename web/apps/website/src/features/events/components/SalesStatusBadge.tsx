import Chip from '@mui/material/Chip';
import type { FC } from 'react';
import type { Event } from '@/lib/seed/events';
import { deriveSalesStatusLabel, deriveSalesUrgencyColor } from '../sales-status-display';

interface SalesStatusBadgeProps {
  event: Event;
}

export const SalesStatusBadge: FC<SalesStatusBadgeProps> = ({ event }) => {
  const label = deriveSalesStatusLabel(event);
  const color = deriveSalesUrgencyColor(event.salesStatus);

  return <Chip size="small" variant="outlined" color={color} label={label} />;
};
