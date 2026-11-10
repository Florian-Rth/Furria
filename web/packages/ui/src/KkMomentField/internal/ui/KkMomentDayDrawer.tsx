import Stack from '@mui/material/Stack';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import type { FC } from 'react';
import type { KkDateQuickChoice } from '../../../internal/date-field';
import { buildDateChoices, parseIsoDate, toIsoDate } from '../../../internal/date-field';
import { KkFieldChoices } from '../../../internal/KkFieldChoices';
import { KkBottomDrawer } from '../../../KkBottomDrawer/KkBottomDrawer';
import { KkMomentFieldLabel } from './KkMomentFieldLabel';

const CLOSE_LABEL = 'Schließen';
const DAY_VIEWS = ['day'] as const;

interface KkMomentDayDrawerProps {
  open: boolean;
  label: string;
  day: string;
  quickDays: readonly KkDateQuickChoice[];
  onDayChange: (day: string) => void;
  onClose: () => void;
}

export const KkMomentDayDrawer: FC<KkMomentDayDrawerProps> = ({
  open,
  label,
  day,
  quickDays,
  onDayChange,
  onClose,
}) => {
  const choices = buildDateChoices(quickDays, null);

  const commit = (picked: string | null): void => {
    if (picked !== null) {
      onDayChange(picked);
    }
    onClose();
  };

  const pickDate = (date: Date | null): void => {
    commit(toIsoDate(date));
  };

  const quickRow =
    choices.length === 0 ? null : (
      <KkFieldChoices label={label} choices={choices} selectedId={day} onSelect={commit} />
    );

  return (
    <KkBottomDrawer open={open} label={label} closeLabel={CLOSE_LABEL} onClose={onClose}>
      <Stack sx={{ gap: 1.5, px: 2, pb: 2, overflowY: 'auto' }}>
        <KkMomentFieldLabel label={label} />
        {quickRow}
        <DateCalendar
          value={parseIsoDate(day)}
          onChange={pickDate}
          views={DAY_VIEWS}
          sx={{ width: '100%', maxWidth: '100%' }}
        />
      </Stack>
    </KkBottomDrawer>
  );
};
