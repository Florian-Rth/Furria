import Stack from '@mui/material/Stack';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import type { FC } from 'react';
import { EMPTY_CHOICE_ID } from './internal/field-choice';
import { KkFieldChoices } from './internal/KkFieldChoices';
import { buildTimeChoices, parseClockTime, toClockTime } from './internal/time-field';
import type { KkSx } from './kk-sx';

const DISPLAY_FORMAT = 'HH:mm';
const NO_QUICK_TIMES: readonly string[] = [];

interface KkTimeFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  quickTimes?: readonly string[];
  allowEmpty?: boolean;
  emptyLabel?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkTimeField: FC<KkTimeFieldProps> = ({
  name,
  label,
  value,
  onChange,
  quickTimes = NO_QUICK_TIMES,
  allowEmpty = false,
  emptyLabel,
  hint,
  required,
  disabled,
  error,
  helperText,
  sx,
}) => {
  const helper = helperText ?? hint;
  const emptyChoiceLabel = allowEmpty ? (emptyLabel ?? null) : null;
  const choices = buildTimeChoices(quickTimes, emptyChoiceLabel);

  const change = (time: Date | null): void => {
    const next = toClockTime(time);

    if (next !== null) {
      onChange(next);
    } else if (time === null && allowEmpty) {
      onChange(EMPTY_CHOICE_ID);
    }
  };

  const choiceRow =
    choices.length === 0 ? null : (
      <KkFieldChoices
        label={label}
        choices={choices}
        selectedId={value}
        disabled={disabled}
        onSelect={onChange}
      />
    );

  return (
    <Stack data-kk-time-field sx={[{ minWidth: 0, gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <TimePicker
        label={label}
        value={parseClockTime(value)}
        onChange={change}
        format={DISPLAY_FORMAT}
        ampm={false}
        disabled={disabled}
        slotProps={{
          field: { clearable: allowEmpty },
          textField: { name, required, error, helperText: helper, fullWidth: true },
        }}
      />
      {choiceRow}
    </Stack>
  );
};
