import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface OrderConfirmationHeadlineProps {
  headline: string;
}

export const OrderConfirmationHeadline: FC<OrderConfirmationHeadlineProps> = ({ headline }) => (
  <Typography
    variant="h1"
    component="h1"
    sx={{ textWrap: 'balance', fontSize: kkTokens.headline.compact }}
  >
    {headline}
  </Typography>
);
