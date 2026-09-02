import { kkTokens } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { BaseSyntheticEvent, FC, PropsWithChildren } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import type { OrderBuyerForm } from '@/features/events/schemas';

interface OrderFlowBuyerFormRootProps extends PropsWithChildren {
  form: UseFormReturn<OrderBuyerForm>;
  onSubmit: (event?: BaseSyntheticEvent) => void;
}

export const OrderFlowBuyerFormRoot: FC<OrderFlowBuyerFormRootProps> = ({
  form,
  onSubmit,
  children,
}) => (
  <FormProvider {...form}>
    <Stack component="form" data-kk-order-buyer-form noValidate onSubmit={onSubmit}>
      <Grid container spacing={kkTokens.layout.fieldGap}>
        {children}
      </Grid>
      <button type="submit" hidden />
    </Stack>
  </FormProvider>
);
