import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface OrderConfirmationHeadlineProps {
  headline: string;
}

export const OrderConfirmationHeadline: FC<OrderConfirmationHeadlineProps> = ({ headline }) => (
  <Typography variant="display" component="h1" sx={{ textWrap: 'balance' }}>
    {headline}
  </Typography>
);
