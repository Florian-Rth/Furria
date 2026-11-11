import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import { DAY_SCHEDULE_TITLE_MAX_LENGTH } from '../calendar-day-schedules';
import { useCalendarDayScheduleCard } from '../hooks/use-calendar-day-schedule-card';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarDayScheduleForm } from '../schemas';
import { CalendarDayScheduleStepRow } from './CalendarDayScheduleStepRow';

const TITLE_LABEL = 'Titel';
const STEPS_LABEL = 'Schritte';
const ADD_STEP_LABEL = 'Schritt hinzufügen';

interface CalendarDayScheduleCardProps {
  cardKey: string;
  index: number;
  schedule: CalendarDayScheduleForm;
  control: CalendarEntryEditorControl;
  onRemove: () => void;
}

export const CalendarDayScheduleCard: FC<CalendarDayScheduleCardProps> = ({
  cardKey,
  index,
  schedule,
  control,
  onRemove,
}) => {
  const card = useCalendarDayScheduleCard({ control, cardKey, index, schedule });

  const changeTitle = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    card.setTitle(event.target.value);
  };

  const rows = card.rows.map((row) => <CalendarDayScheduleStepRow key={row.key} row={row} />);
  const addButton = card.canAddStep ? (
    <KkButton
      variant="text"
      size="small"
      startIcon={<KkIcon name="add" size="small" />}
      onClick={card.addStep}
      sx={{ alignSelf: 'flex-start' }}
    >
      {ADD_STEP_LABEL}
    </KkButton>
  ) : null;

  return (
    <KkAddOnCard
      icon={CALENDAR_ADD_ON_ICONS.daySchedule}
      title={CALENDAR_ADD_ON_LABELS.daySchedule}
      meta={card.stepCountLabel}
      removeLabel={card.removeLabel}
      onRemove={onRemove}
    >
      <KkTextField
        name={card.titleFieldName}
        label={TITLE_LABEL}
        value={schedule.title}
        maxLength={DAY_SCHEDULE_TITLE_MAX_LENGTH}
        error={card.titleError.hasError}
        helperText={card.titleError.text}
        onChange={changeTitle}
      />
      <Stack
        component="ol"
        aria-label={STEPS_LABEL}
        sx={{ gap: 1, minWidth: 0, m: 0, p: 0, listStyle: 'none' }}
      >
        {rows}
      </Stack>
      {addButton}
    </KkAddOnCard>
  );
};
