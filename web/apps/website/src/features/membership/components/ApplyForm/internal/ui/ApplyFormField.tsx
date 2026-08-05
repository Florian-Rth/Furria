import TextField from '@mui/material/TextField';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

type TextFieldName = Exclude<
  {
    [Key in keyof MembershipApplicationForm]: MembershipApplicationForm[Key] extends string
      ? Key
      : never;
  }[keyof MembershipApplicationForm],
  'honeypot'
>;

interface ApplyFormFieldProps {
  name: TextFieldName;
  label: string;
  required: boolean;
  type?: 'text' | 'date' | 'email' | 'tel';
  autoComplete?: string;
}

export const ApplyFormField: FC<ApplyFormFieldProps> = ({
  name,
  label,
  required,
  type = 'text',
  autoComplete,
}) => {
  const { register, formState } = useFormContext<MembershipApplicationForm>();
  const { ref, ...field } = register(name);
  const error = formState.errors[name];
  const shrinkLabel = type === 'date' ? true : undefined;

  return (
    <TextField
      {...field}
      inputRef={ref}
      type={type}
      label={label}
      required={required}
      autoComplete={autoComplete}
      fullWidth
      error={error !== undefined}
      helperText={error?.message}
      slotProps={{ inputLabel: { shrink: shrinkLabel } }}
    />
  );
};
