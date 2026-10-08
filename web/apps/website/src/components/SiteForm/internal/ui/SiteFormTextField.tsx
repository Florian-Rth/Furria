import TextField from '@mui/material/TextField';
import type { FC } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import type { SiteFormTextFieldType } from '../../site-form-types';

interface SiteFormTextFieldProps {
  registration: UseFormRegisterReturn;
  error: FieldError | undefined;
  label: string;
  required: boolean;
  type?: SiteFormTextFieldType;
  autoComplete?: string;
  minRows?: number;
}

export const SiteFormTextField: FC<SiteFormTextFieldProps> = ({
  registration,
  error,
  label,
  required,
  type = 'text',
  autoComplete,
  minRows,
}) => {
  const { ref, ...field } = registration;
  const shrinkLabel = type === 'date' ? true : undefined;
  const multiline = minRows !== undefined;

  return (
    <TextField
      {...field}
      inputRef={ref}
      type={type}
      label={label}
      required={required}
      autoComplete={autoComplete}
      multiline={multiline}
      minRows={minRows}
      fullWidth
      error={error !== undefined}
      helperText={error?.message}
      slotProps={{ inputLabel: { shrink: shrinkLabel } }}
    />
  );
};
