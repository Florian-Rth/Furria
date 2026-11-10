import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { POLL_OPTION_LABEL_MAX_LENGTH } from '../calendar-polls';
import type { CalendarPollOptionRowControl } from '../hooks/use-calendar-poll-card';

interface CalendarPollOptionRowProps {
  row: CalendarPollOptionRowControl;
}

export const CalendarPollOptionRow: FC<CalendarPollOptionRowProps> = ({ row }) => {
  const changeLabel = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    row.setLabel(event.target.value);
  };

  const removeButton = row.canRemove ? (
    <KkIconButton label={row.removeLabel} icon="close" size="small" onClick={row.remove} />
  ) : null;

  return (
    <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 0.5, minWidth: 0 }}>
      <KkTextField
        name={row.fieldName}
        label={row.fieldLabel}
        required
        readOnly={row.isLocked}
        value={row.label}
        maxLength={POLL_OPTION_LABEL_MAX_LENGTH}
        hint={row.hint}
        error={row.error.hasError}
        helperText={row.error.text}
        onChange={changeLabel}
        sx={{ flexGrow: 1, minWidth: 0 }}
      />
      {removeButton}
    </Stack>
  );
};
