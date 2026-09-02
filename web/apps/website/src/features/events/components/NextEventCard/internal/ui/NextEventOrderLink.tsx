import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildOrderFlowHref } from '@/features/events/event-display';
import { orderEntryCtaLabel } from '@/features/events/order-flow-content';

interface NextEventOrderLinkProps {
  eventId: string;
}

export const NextEventOrderLink: FC<NextEventOrderLinkProps> = ({ eventId }) => (
  <Button component={RouterLink} to={buildOrderFlowHref(eventId)} variant="contained" size="large">
    {orderEntryCtaLabel}
  </Button>
);
