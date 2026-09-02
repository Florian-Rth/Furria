import { KkCard } from '@furria/ui';
import Button from '@mui/material/Button';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventCardSummary } from '@/features/events/components/EventCardSummary';
import { buildOrderFlowHref } from '@/features/events/event-display';
import { orderEntryCtaLabel } from '@/features/events/order-flow-content';
import type { Event } from '@/lib/seed/events';

interface OrderCrossSellCardProps {
  event: Event;
}

export const OrderCrossSellCard: FC<OrderCrossSellCardProps> = ({ event }) => (
  <KkCard>
    <KkCard.Body>
      <EventCardSummary event={event} />
      <KkCard.Footer>
        <Button
          component={RouterLink}
          to={buildOrderFlowHref(event.id)}
          variant="contained"
          color="primary"
        >
          {orderEntryCtaLabel}
        </Button>
      </KkCard.Footer>
    </KkCard.Body>
  </KkCard>
);
