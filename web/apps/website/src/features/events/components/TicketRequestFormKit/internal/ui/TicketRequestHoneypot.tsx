import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { SiteForm } from '@/components/SiteForm/SiteForm';
import type { TicketRequestForm } from '@/features/events/schemas';

export const TicketRequestHoneypot: FC = () => {
  const { register } = useFormContext<TicketRequestForm>();

  return <SiteForm.Honeypot registration={register('honeypot')} />;
};
