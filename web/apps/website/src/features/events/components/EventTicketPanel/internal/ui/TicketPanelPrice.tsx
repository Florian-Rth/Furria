import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { ticketPanelKicker, ticketPanelPriceLabel } from '@/features/events/event-detail-content';
import { formatEuros } from '@/lib/money';

interface TicketPanelPriceProps {
  priceCents: number | null;
}

export const TicketPanelPrice: FC<TicketPanelPriceProps> = ({ priceCents }) => {
  const priceLine =
    priceCents === null ? null : (
      <Stack direction="row" sx={{ gap: 1, alignItems: 'baseline' }}>
        <Typography variant="h1" component="span" sx={{ lineHeight: 1 }}>
          {formatEuros(priceCents)}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {ticketPanelPriceLabel}
        </Typography>
      </Stack>
    );

  return (
    <Stack sx={{ gap: 1 }}>
      <KkEyebrow tone="muted">{ticketPanelKicker}</KkEyebrow>
      {priceLine}
    </Stack>
  );
};
