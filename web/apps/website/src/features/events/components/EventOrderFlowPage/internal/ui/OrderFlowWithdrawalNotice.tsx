import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { orderWithdrawalNotice } from '@/features/events/order-flow-content';

export const OrderFlowWithdrawalNotice: FC = () => (
  <Alert severity="info" variant="outlined" role="note" data-kk-order-withdrawal-notice>
    <AlertTitle>{orderWithdrawalNotice.title}</AlertTitle>
    <Typography variant="body2">{orderWithdrawalNotice.body}</Typography>
  </Alert>
);
