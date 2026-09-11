import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import { KkFieldChoices } from './internal/KkFieldChoices';
import { KkEyebrow } from './KkEyebrow';
import type { KkSx } from './kk-sx';

const INLINE_CHOICE_LIMIT = 4;

export interface KkSelectOption {
  value: string;
  label: string;
}

interface KkSelectFieldProps {
  name: string;
  label: string;
  value: string;
  options: readonly KkSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkSelectField: FC<KkSelectFieldProps> = ({
  name,
  label,
  value,
  options,
  onChange,
  placeholder,
  hint,
  disabled = false,
  error,
  helperText,
  sx,
}) => {
  const helper = helperText ?? hint;
  const helperColor = error === true ? 'error.main' : 'text.secondary';
  const callerSx = Array.isArray(sx) ? sx : [sx];

  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  const helperLine =
    helper === undefined ? null : (
      <Typography variant="caption" sx={{ color: helperColor, textWrap: 'pretty' }}>
        {helper}
      </Typography>
    );

  if (options.length <= INLINE_CHOICE_LIMIT) {
    const choices = options.map((option) => ({ id: option.value, label: option.label }));

    return (
      <Stack data-kk-select-field sx={[{ minWidth: 0, gap: 1 }, ...callerSx]}>
        <KkEyebrow tone="muted">{label}</KkEyebrow>
        <KkFieldChoices
          label={label}
          choices={choices}
          selectedId={value}
          disabled={disabled}
          onSelect={onChange}
        />
        {helperLine}
      </Stack>
    );
  }

  const placeholderItem =
    placeholder === undefined ? null : <MenuItem value="">{placeholder}</MenuItem>;
  const optionItems = options.map((option) => (
    <MenuItem key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ));

  return (
    <TextField
      select
      name={name}
      label={label}
      value={value}
      onChange={change}
      disabled={disabled}
      error={error}
      helperText={helper}
      variant="outlined"
      fullWidth
      data-kk-select-field
      sx={[{ minWidth: 0 }, ...callerSx]}
    >
      {placeholderItem}
      {optionItems}
    </TextField>
  );
};
