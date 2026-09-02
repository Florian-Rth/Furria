import { zodResolver } from '@hookform/resolvers/zod';
import type { BaseSyntheticEvent } from 'react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { buildOrderBuyer } from '@/features/events/order-buyer';
import type { OrderBuyerForm } from '@/features/events/schemas';
import { EMPTY_ORDER_BUYER, OrderBuyerFormSchema } from '@/features/events/schemas';
import type { OrderBuyer } from '@/lib/seed/orders';

export interface OrderBuyerFormState {
  form: UseFormReturn<OrderBuyerForm>;
  submit: (event?: BaseSyntheticEvent) => void;
  buyer: OrderBuyer | null;
}

export const useOrderBuyerForm = (onSubmitted: () => void): OrderBuyerFormState => {
  const [buyer, setBuyer] = useState<OrderBuyer | null>(null);

  const form = useForm<OrderBuyerForm>({
    mode: 'onTouched',
    resolver: zodResolver(OrderBuyerFormSchema),
    defaultValues: EMPTY_ORDER_BUYER,
  });

  const handleValidSubmit = form.handleSubmit((values) => {
    setBuyer(buildOrderBuyer(values));
    onSubmitted();
  });

  return {
    form,
    buyer,
    submit: (event) => {
      void handleValidSubmit(event);
    },
  };
};
