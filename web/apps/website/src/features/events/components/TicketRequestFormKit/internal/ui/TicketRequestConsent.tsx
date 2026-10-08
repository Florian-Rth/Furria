import type { FC, PropsWithChildren } from 'react';
import { useFormContext } from 'react-hook-form';
import { SiteForm } from '@/components/SiteForm/SiteForm';
import type { TicketRequestForm } from '@/features/events/schemas';

export const TicketRequestConsent: FC<PropsWithChildren> = ({ children }) => {
  const { register, formState } = useFormContext<TicketRequestForm>();

  return (
    <SiteForm.Consent registration={register('consent')} error={formState.errors.consent}>
      {children}
    </SiteForm.Consent>
  );
};
