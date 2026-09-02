import { KkNote } from '@furria/ui';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  orderErrorContent,
  orderErrorMailHref,
  orderErrorMailLabel,
} from '@/features/events/order-confirmation-content';
import { OrderConfirmationHeadline } from './OrderConfirmationHeadline';

export const OrderConfirmationError: FC = () => (
  <Stack role="alert" sx={{ gap: 2, alignItems: 'flex-start' }}>
    <Chip variant="outlined" color="error" label={orderErrorContent.kicker} />
    <OrderConfirmationHeadline headline={orderErrorContent.headline} />
    <KkNote>{orderErrorContent.body}</KkNote>
    <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', pt: 1 }}>
      <Button component={RouterLink} to="/events" variant="contained" color="primary" size="large">
        {orderErrorContent.eventsCtaLabel}
      </Button>
      <Button href={orderErrorMailHref} variant="outlined" color="primary" size="large">
        {orderErrorMailLabel}
      </Button>
    </Stack>
  </Stack>
);
