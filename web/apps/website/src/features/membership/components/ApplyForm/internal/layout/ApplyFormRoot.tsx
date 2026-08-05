import Stack from '@mui/material/Stack';
import type { FC, FormEvent, PropsWithChildren } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

interface ApplyFormRootProps extends PropsWithChildren {
  form: UseFormReturn<MembershipApplicationForm>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const ApplyFormRoot: FC<ApplyFormRootProps> = ({ form, onSubmit, children }) => (
  <FormProvider {...form}>
    <Stack component="form" data-kk-apply-form noValidate onSubmit={onSubmit}>
      {children}
    </Stack>
  </FormProvider>
);
