import type { FC, PropsWithChildren } from 'react';
import { useFormContext } from 'react-hook-form';
import { SiteForm } from '@/components/SiteForm/SiteForm';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

export const ApplyConsentCheckbox: FC<PropsWithChildren> = ({ children }) => {
  const { register, formState } = useFormContext<MembershipApplicationForm>();

  return (
    <SiteForm.Consent registration={register('consent')} error={formState.errors.consent}>
      {children}
    </SiteForm.Consent>
  );
};
