import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { orderDemoNotice } from '@/features/events/order-confirmation-content';

export const OrderDemoNotice: FC = () => (
  <Alert severity="warning" variant="outlined" role="note" data-kk-order-demo-notice>
    <AlertTitle>{orderDemoNotice.title}</AlertTitle>
    <Typography variant="body2">{orderDemoNotice.body}</Typography>
  </Alert>
);
