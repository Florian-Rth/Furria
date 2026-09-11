import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';
import { KkFieldChoices } from './internal/KkFieldChoices';
import {
  buildSessionChoices,
  formatSessionYear,
  readSessionInput,
  resolveSessionChoiceId,
  SESSION_YEAR_LENGTH,
  sessionChoiceId,
  sessionYearToInput,
} from './internal/session-field';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const SESSION_LABEL_FONT_SIZE = '0.8125rem';

interface KkSessionFieldProps {
  name: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  currentSessionYear: number;
  allowOpen?: boolean;
  openLabel?: string;
  hint?: string;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkSessionField: FC<KkSessionFieldProps> = ({
  name,
  label,
  value,
  onChange,
  currentSessionYear,
  allowOpen = false,
  openLabel,
  hint,
  error,
  helperText,
  sx,
}) => {
  const [draft, setDraft] = useState(() => sessionYearToInput(value));
  const [publishedValue, setPublishedValue] = useState(value);

  if (publishedValue !== value) {
    setPublishedValue(value);
    setDraft(sessionYearToInput(value));
  }

  const helper = helperText ?? hint;
  const openChoiceLabel = allowOpen ? (openLabel ?? null) : null;
  const choices = buildSessionChoices(currentSessionYear, openChoiceLabel);
  const sessionLabel = value === null ? null : formatSessionYear(value);

  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.value;
    const input = readSessionInput(next, allowOpen);

    setDraft(next);

    if (input.isPublishable) {
      onChange(input.year);
    }
  };

  const restoreDraft = (): void => {
    setDraft(sessionYearToInput(value));
  };

  const selectChoice = (id: string): void => {
    onChange(resolveSessionChoiceId(id));
  };

  const endAdornment =
    sessionLabel === null ? undefined : (
      <InputAdornment position="end">
        <Typography
          sx={{
            color: 'text.secondary',
            fontFamily: kkTokens.font.display,
            fontSize: SESSION_LABEL_FONT_SIZE,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {sessionLabel}
        </Typography>
      </InputAdornment>
    );

  return (
    <Stack data-kk-session-field sx={[{ minWidth: 0, gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <TextField
        name={name}
        label={label}
        value={draft}
        onChange={change}
        onBlur={restoreDraft}
        error={error}
        helperText={helper}
        autoComplete="off"
        variant="outlined"
        fullWidth
        slotProps={{
          htmlInput: { inputMode: 'numeric', maxLength: SESSION_YEAR_LENGTH },
          input: { endAdornment },
        }}
      />
      <KkFieldChoices
        label={label}
        choices={choices}
        selectedId={sessionChoiceId(value)}
        onSelect={selectChoice}
      />
    </Stack>
  );
};
