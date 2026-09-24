import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const DEFAULT_ROWS = 4;
const HELPER_INSET = 1.75;

const defaultCountLabel = (used: number, max: number): string => `${used} / ${max}`;

interface KkTextAreaProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  countLabel?: (used: number, max: number) => string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkTextArea: FC<KkTextAreaProps> = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  rows = DEFAULT_ROWS,
  maxLength,
  showCount = false,
  countLabel = defaultCountLabel,
  placeholder,
  hint,
  required,
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
          color: 'text.secondary',
          typography: 'caption',
          fontWeight: 700,
          letterSpacing: kkTokens.type.tracking.tight,
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
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
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
