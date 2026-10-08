import type { FC, FormEvent, PropsWithChildren } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { SiteForm } from '@/components/SiteForm/SiteForm';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

interface ApplyFormRootProps extends PropsWithChildren {
  form: UseFormReturn<MembershipApplicationForm>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const ApplyFormRoot: FC<ApplyFormRootProps> = ({ form, onSubmit, children }) => (
  <FormProvider {...form}>
    <SiteForm onSubmit={onSubmit}>{children}</SiteForm>
  </FormProvider>
);
