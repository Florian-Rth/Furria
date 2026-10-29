import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { StickyActionBar } from '@/features/events/components/StickyActionBar';
import {
  presalePlacesAnchorId,
  presalePlacesJumpLabel,
  ticketPanelPriceLabel,
} from '@/features/events/event-detail-content';
import { usePresalePlacesJump } from '@/features/events/hooks/use-presale-places-jump';
import { formatEuros } from '@/lib/money';
import type { EventDetail } from '@/lib/public-events/schemas';

const PRESALE_PLACES_HREF = `#${presalePlacesAnchorId}`;

interface EventStickyCtaProps {
  event: EventDetail;
}

export const EventStickyCta: FC<EventStickyCtaProps> = ({ event }) => {
  const jumpToPresalePlaces = usePresalePlacesJump();

  if (event.presalePlaces.length === 0) {
    return null;
  }

  const priceLine =
    event.priceCents === null ? null : (
      <Typography variant="subtitle1" component="p" sx={{ fontWeight: 800 }}>
        {formatEuros(event.priceCents)}{' '}
        <Typography variant="caption" component="span" sx={{ color: 'text.secondary' }}>
          {ticketPanelPriceLabel}
        </Typography>
      </Typography>
    );

  return (
    <StickyActionBar hideFrom="desktop" sx={{ justifyContent: 'space-between' }}>
      {priceLine}
      <Button
        component="a"
        href={PRESALE_PLACES_HREF}
        onClick={jumpToPresalePlaces}
        variant="contained"
        color="primary"
        size="large"
        sx={{ flexGrow: 1, maxWidth: '14rem' }}
      >
        {presalePlacesJumpLabel}
      </Button>
    </StickyActionBar>
  );
};
