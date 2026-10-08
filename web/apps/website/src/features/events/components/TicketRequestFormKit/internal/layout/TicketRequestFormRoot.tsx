import type { FC, FormEvent, PropsWithChildren } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { SiteForm } from '@/components/SiteForm/SiteForm';
import type { TicketRequestForm } from '@/features/events/schemas';

interface TicketRequestFormRootProps extends PropsWithChildren {
  form: UseFormReturn<TicketRequestForm>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const TicketRequestFormRoot: FC<TicketRequestFormRootProps> = ({
  form,
  onSubmit,
  children,
}) => (
  <FormProvider {...form}>
    <SiteForm onSubmit={onSubmit}>{children}</SiteForm>
  </FormProvider>
);
