import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import { useId } from 'react';
import { KkFieldChoices } from './internal/KkFieldChoices';
import { KkEyebrow } from './KkEyebrow';
import type { KkSx } from './kk-sx';

type KkSelectPresentation = 'auto' | 'choices' | 'select';

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
  presentation?: KkSelectPresentation;
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
  presentation = 'auto',
  placeholder,
  hint,
  disabled = false,
  error,
  helperText,
  sx,
}) => {
  const fieldId = useId();
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;
  const helper = helperText ?? hint;
  const helperColor = error === true ? 'error.main' : 'text.secondary';
  const callerSx = Array.isArray(sx) ? sx : [sx];
  const fitsInline = options.length <= INLINE_CHOICE_LIMIT;
  const rendersChoices = presentation === 'choices' || (presentation === 'auto' && fitsInline);

  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  const helperLine =
    helper === undefined ? null : (
      <Typography id={helperId} variant="caption" sx={{ color: helperColor, textWrap: 'pretty' }}>
        {helper}
      </Typography>
    );

  if (rendersChoices) {
    const choices = options.map((option) => ({ id: option.value, label: option.label }));

    return (
      <Stack data-kk-select-field sx={[{ minWidth: 0, gap: 1 }, ...callerSx]}>
        <Box component="span" id={labelId}>
          <KkEyebrow tone="muted">{label}</KkEyebrow>
        </Box>
        <KkFieldChoices
          labelledBy={labelId}
          choices={choices}
          selectedId={value}
          disabled={disabled}
          invalid={error === true}
          onSelect={onChange}
        />
        <Box component="input" type="hidden" name={name} value={value} readOnly />
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
