import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { ChangeEvent, FC } from 'react';
import { KkFieldChoices } from './internal/KkFieldChoices';
import type { KkSx } from './kk-sx';

const NO_SUGGESTIONS: readonly string[] = [];

interface KkChipFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: readonly string[];
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkChipField: FC<KkChipFieldProps> = ({
  name,
  label,
  value,
  onChange,
  suggestions = NO_SUGGESTIONS,
  placeholder,
  hint,
  maxLength,
  error,
  helperText,
  sx,
}) => {
  const helper = helperText ?? hint;
  const choices = suggestions.map((suggestion) => ({ id: suggestion, label: suggestion }));

  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  const choiceRow =
    choices.length === 0 ? null : (
      <KkFieldChoices label={label} choices={choices} selectedId={value} onSelect={onChange} />
    );

  return (
    <Stack data-kk-chip-field sx={[{ minWidth: 0, gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <TextField
        name={name}
        label={label}
        value={value}
        onChange={change}
        placeholder={placeholder}
        error={error}
        helperText={helper}
        autoComplete="off"
        variant="outlined"
        fullWidth
        slotProps={{ htmlInput: { maxLength } }}
      />
      {choiceRow}
    </Stack>
  );
};
