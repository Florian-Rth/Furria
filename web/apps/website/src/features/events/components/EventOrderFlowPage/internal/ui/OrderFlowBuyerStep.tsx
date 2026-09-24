import { KkNote } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { BaseSyntheticEvent, FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { OrderPanel } from '@/features/events/components/OrderPanel';
import {
  orderBuyerFieldLabels,
  orderBuyerHeadline,
  orderBuyerNote,
} from '@/features/events/order-flow-content';
import type { OrderBuyerForm } from '@/features/events/schemas';
import { OrderFlowBuyerFormRoot } from '../layout/OrderFlowBuyerFormRoot';
import { OrderFlowBuyerField } from './OrderFlowBuyerField';

interface OrderFlowBuyerStepProps {
  form: UseFormReturn<OrderBuyerForm>;
  onSubmit: (event?: BaseSyntheticEvent) => void;
}

export const OrderFlowBuyerStep: FC<OrderFlowBuyerStepProps> = ({ form, onSubmit }) => (
  <OrderPanel tone="content" sx={{ gap: 3 }}>
    <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
      <Typography variant="h2" component="h2">
        {orderBuyerHeadline}
      </Typography>
      <KkNote>{orderBuyerNote}</KkNote>
    </Stack>
    <OrderFlowBuyerFormRoot form={form} onSubmit={onSubmit}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <OrderFlowBuyerField
          name="firstName"
          label={orderBuyerFieldLabels.firstName}
          type="text"
          autoComplete="given-name"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <OrderFlowBuyerField
          name="lastName"
          label={orderBuyerFieldLabels.lastName}
          type="text"
          autoComplete="family-name"
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <OrderFlowBuyerField
          name="email"
          label={orderBuyerFieldLabels.email}
          type="email"
          autoComplete="email"
        />
      </Grid>
    </OrderFlowBuyerFormRoot>
  </OrderPanel>
);
