import TextField from '@mui/material/TextField';
import type { FC } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import type { OrderBuyerForm } from '@/features/events/schemas';

interface OrderFlowBuyerFieldProps {
  name: keyof OrderBuyerForm;
  label: string;
  type: 'text' | 'email';
  autoComplete: string;
}

export const OrderFlowBuyerField: FC<OrderFlowBuyerFieldProps> = ({
  name,
  label,
  type,
  autoComplete,
}) => {
  const { register, control } = useFormContext<OrderBuyerForm>();
  const { errors } = useFormState({ control, name });
  const { ref, ...field } = register(name);
  const error = errors[name];

  return (
    <TextField
      {...field}
      inputRef={ref}
      type={type}
      label={label}
      required
      autoComplete={autoComplete}
      fullWidth
      error={error !== undefined}
      helperText={error?.message}
    />
  );
};
