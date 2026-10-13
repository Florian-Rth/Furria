import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import { redInk } from './internal/red-ink';
import { KkEyebrow } from './KkEyebrow';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const STUB_WIDTH = 72;
const NOTCH_RADIUS = 9;
const CURRENCY_MARK = '€';
const NOTCH_CENTER = `calc(100% - ${STUB_WIDTH}px)`;
const notchAt = (edge: string): string =>
  `radial-gradient(circle ${NOTCH_RADIUS}px at ${NOTCH_CENTER} ${edge}, transparent ${NOTCH_RADIUS}px, #000 ${NOTCH_RADIUS + 0.5}px)`;
const TICKET_MASK = `${notchAt('0')}, ${notchAt('100%')}`;

interface KkPriceFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkPriceField: FC<KkPriceFieldProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder,
  error = false,
  helperText,
  sx,
}) => {
  const restingBorder = error ? 'error.main' : 'divider';
  const focusBorder = error ? 'error.main' : 'primary.main';
  const helperColor = error ? 'error.main' : 'text.secondary';

  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onChange(event.target.value);
  };

  const helper =
    helperText === undefined ? null : (
      <Typography variant="caption" sx={{ color: helperColor, px: 1.75 }}>
        {helperText}
      </Typography>
    );

  return (
    <Stack data-kk-price-field sx={[{ minWidth: 0, gap: 0.5 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack
        direction="row"
        component="label"
        sx={{
          minWidth: 0,
          cursor: 'text',
          backgroundColor: 'background.paper',
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: restingBorder,
          borderRadius: `${kkTokens.radius.base}px`,
          maskImage: TICKET_MASK,
          maskComposite: 'intersect',
          WebkitMaskImage: TICKET_MASK,
          WebkitMaskComposite: 'source-in',
          '&:focus-within': { borderColor: focusBorder },
        }}
      >
        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25, px: 2, py: 1.5 }}>
          <KkEyebrow tone="muted">{label}</KkEyebrow>
          <InputBase
            name={name}
            value={value}
            onChange={change}
            placeholder={placeholder}
            autoComplete="off"
            slotProps={{ input: { inputMode: 'decimal', 'aria-label': label } }}
            sx={{
              typography: 'h2',
              color: 'text.primary',
              '& input': { p: 0 },
              '& input::placeholder': { color: 'text.disabled', opacity: 1 },
            }}
          />
        </Stack>
        <Stack
          aria-hidden
          sx={(theme) => ({
            width: STUB_WIDTH,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderLeftWidth: kkTokens.line.hair,
            borderLeftStyle: 'dashed',
            borderLeftColor: 'divider',
            typography: 'h2',
            ...redInk(theme),
          })}
        >
          {CURRENCY_MARK}
        </Stack>
      </Stack>
      {helper}
    </Stack>
  );
};
