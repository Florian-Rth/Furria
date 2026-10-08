import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { SiteForm } from '@/components/SiteForm/SiteForm';
import type { SiteFormTextFieldType } from '@/components/SiteForm/site-form-types';
import type { TicketRequestForm } from '@/features/events/schemas';

type TextFieldName = 'name' | 'phone' | 'email' | 'message';

interface TicketRequestFieldProps {
  name: TextFieldName;
  label: string;
  required: boolean;
  type?: SiteFormTextFieldType;
  autoComplete?: string;
  minRows?: number;
}

export const TicketRequestField: FC<TicketRequestFieldProps> = ({
  name,
  label,
  required,
  type,
  autoComplete,
  minRows,
}) => {
  const { register, formState } = useFormContext<TicketRequestForm>();

  return (
    <SiteForm.TextField
      registration={register(name)}
      error={formState.errors[name]}
      label={label}
      required={required}
      type={type}
      autoComplete={autoComplete}
      minRows={minRows}
    />
  );
};
