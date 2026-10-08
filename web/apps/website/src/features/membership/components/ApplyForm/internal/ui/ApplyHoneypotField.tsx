import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { SiteForm } from '@/components/SiteForm/SiteForm';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

export const ApplyHoneypotField: FC = () => {
  const { register } = useFormContext<MembershipApplicationForm>();

  return <SiteForm.Honeypot registration={register('honeypot')} />;
};
