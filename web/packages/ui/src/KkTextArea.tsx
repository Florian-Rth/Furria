import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import type { KkSx } from './kk-sx';

const DEFAULT_ROWS = 4;
const COUNT_FONT_SIZE = '0.6875rem';
const HELPER_INSET = 1.75;

const defaultCountLabel = (used: number, max: number): string => `${used} / ${max}`;

interface KkTextAreaProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  countLabel?: (used: number, max: number) => string;
  placeholder?: string;
  hint?: string;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkTextArea: FC<KkTextAreaProps> = ({
  name,
  label,
  value,
  onChange,
  rows = DEFAULT_ROWS,
  maxLength,
  showCount = false,
  countLabel = defaultCountLabel,
  placeholder,
  hint,
  error,
  helperText,
  sx,
}) => {
  const helper = helperText ?? hint;
  const counterText =
    !showCount || maxLength === undefined ? null : countLabel(value.length, maxLength);

  const change = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  const counter =
    counterText === null ? null : (
      <Typography
        sx={{
          alignSelf: 'flex-end',
          color: 'text.disabled',
          fontSize: COUNT_FONT_SIZE,
          fontWeight: 700,
          letterSpacing: '0.02em',
          px: HELPER_INSET,
        }}
      >
        {counterText}
      </Typography>
    );

  return (
    <Stack data-kk-text-area sx={[{ minWidth: 0, gap: 0.5 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <TextField
        name={name}
        label={label}
        value={value}
        onChange={change}
        placeholder={placeholder}
        error={error}
        helperText={helper}
        multiline
        rows={rows}
        variant="outlined"
        fullWidth
        slotProps={{ htmlInput: { maxLength } }}
      />
      {counter}
    </Stack>
  );
};
