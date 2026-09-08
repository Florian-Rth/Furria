import InputAdornment from '@mui/material/InputAdornment';
import type { OutlinedTextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import type { FC, ReactNode } from 'react';
import type { KkSx } from './kk-sx';

type KkTextFieldType = 'text' | 'email' | 'password';
type KkTextFieldInputMode = 'text' | 'email';

interface KkTextFieldProps {
  name: string;
  label: string;
  type?: KkTextFieldType;
  inputMode?: KkTextFieldInputMode;
  autoComplete?: string;
  required?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  value?: string;
  endAdornment?: ReactNode;
  onChange?: OutlinedTextFieldProps['onChange'];
  onBlur?: OutlinedTextFieldProps['onBlur'];
  inputRef?: OutlinedTextFieldProps['inputRef'];
  sx?: KkSx;
}

export const KkTextField: FC<KkTextFieldProps> = ({
  name,
  label,
  type = 'text',
  inputMode,
  autoComplete,
  required,
  autoFocus,
  disabled,
  error,
  helperText,
  value,
  endAdornment,
  onChange,
  onBlur,
  inputRef,
  sx,
}) => {
  const adornment =
    endAdornment === undefined ? undefined : (
      <InputAdornment position="end">{endAdornment}</InputAdornment>
    );

  return (
    <TextField
      name={name}
      label={label}
      type={type}
      autoComplete={autoComplete}
      required={required}
      autoFocus={autoFocus}
      disabled={disabled}
      error={error}
      helperText={helperText}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      inputRef={inputRef}
      variant="outlined"
      fullWidth
      data-kk-text-field
      slotProps={{ htmlInput: { inputMode }, input: { endAdornment: adornment } }}
      sx={sx}
    />
  );
};
