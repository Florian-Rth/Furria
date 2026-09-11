import Stack from '@mui/material/Stack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { FC } from 'react';
import type { KkDateQuickChoice } from './internal/date-field';
import {
  buildDateChoices,
  dateChoiceId,
  parseIsoDate,
  readDateChange,
  resolveDateChoiceId,
} from './internal/date-field';
import { KkFieldChoices } from './internal/KkFieldChoices';
import type { KkSx } from './kk-sx';

const DISPLAY_FORMAT = 'dd.MM.yyyy';
const NO_QUICK_CHOICES: readonly KkDateQuickChoice[] = [];

export type { KkDateQuickChoice } from './internal/date-field';

interface KkDateFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  quickChoices?: readonly KkDateQuickChoice[];
  allowEmpty?: boolean;
  emptyLabel?: string;
  hint?: string;
  error?: boolean;
  helperText?: string;
  sx?: KkSx;
}

export const KkDateField: FC<KkDateFieldProps> = ({
  name,
  label,
  value,
  onChange,
  quickChoices = NO_QUICK_CHOICES,
  allowEmpty = false,
  emptyLabel,
  hint,
  error,
  helperText,
  sx,
}) => {
  const helper = helperText ?? hint;
  const emptyChoiceLabel = allowEmpty ? (emptyLabel ?? null) : null;
  const choices = buildDateChoices(quickChoices, emptyChoiceLabel);

  const change = (date: Date | null): void => {
    const next = readDateChange(date, allowEmpty);

    if (next.isPublishable) {
      onChange(next.value);
    }
  };

  const selectChoice = (id: string): void => {
    onChange(resolveDateChoiceId(id));
  };

  const choiceRow =
    choices.length === 0 ? null : (
      <KkFieldChoices
        label={label}
        choices={choices}
        selectedId={dateChoiceId(value)}
        onSelect={selectChoice}
      />
    );

  return (
    <Stack data-kk-date-field sx={[{ minWidth: 0, gap: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <DatePicker
        label={label}
        value={parseIsoDate(value)}
        onChange={change}
        format={DISPLAY_FORMAT}
        slotProps={{
          field: { clearable: allowEmpty },
          textField: { name, error, helperText: helper, fullWidth: true },
        }}
      />
      {choiceRow}
    </Stack>
  );
};
