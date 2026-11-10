import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import { KkButton } from '@furria/ui/KkButton';
import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import { KkTextField } from '@furria/ui/KkTextField';
import { KkTimeField } from '@furria/ui/KkTimeField';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import { POLL_QUESTION_MAX_LENGTH } from '../calendar-polls';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import { useCalendarPollCard } from '../hooks/use-calendar-poll-card';
import type { CalendarEntry, CalendarPollForm } from '../schemas';
import { CalendarPollOptionRow } from './CalendarPollOptionRow';

const QUESTION_LABEL = 'Frage';
const ADD_OPTION_LABEL = 'Antwort hinzufügen';
const MULTIPLE_LABEL = 'Mehrere Antworten erlaubt';
const ANONYMOUS_LABEL = 'Anonym';
const DEADLINE_DAY_LABEL = 'Abstimmen bis';
const DEADLINE_EMPTY_LABEL = 'Bis zum Beginn';
const DEADLINE_TIME_LABEL = 'Uhrzeit';

interface CalendarPollCardProps {
  cardKey: string;
  index: number;
  poll: CalendarPollForm;
  control: CalendarEntryEditorControl;
  entry: CalendarEntry | null;
  onRemove: () => void;
}

export const CalendarPollCard: FC<CalendarPollCardProps> = ({
  cardKey,
  index,
  poll,
  control,
  entry,
  onRemove,
}) => {
  const card = useCalendarPollCard({ control, cardKey, index, poll, entry });

  const changeQuestion = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    card.setQuestion(event.target.value);
  };

  const rows = card.rows.map((row) => <CalendarPollOptionRow key={row.key} row={row} />);
  const addButton = card.canAddOption ? (
    <KkButton
      variant="text"
      size="small"
      startIcon={<KkIcon name="add" size="small" />}
      onClick={card.addOption}
      sx={{ alignSelf: 'flex-start' }}
    >
      {ADD_OPTION_LABEL}
    </KkButton>
  ) : null;

  return (
    <KkAddOnCard
      icon={CALENDAR_ADD_ON_ICONS.poll}
      title={CALENDAR_ADD_ON_LABELS.poll}
      meta={card.voterCountLabel}
      removeLabel={card.removeLabel}
      onRemove={onRemove}
    >
      <KkTextField
        name={card.fieldNames.question}
        label={QUESTION_LABEL}
        required
        readOnly={card.isQuestionLocked}
        value={poll.question}
        maxLength={POLL_QUESTION_MAX_LENGTH}
        error={card.questionError.hasError}
        helperText={card.questionError.text}
        onChange={changeQuestion}
      />
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        {rows}
        {addButton}
      </Stack>
      <KkSwitchRow
        label={MULTIPLE_LABEL}
        checked={poll.allowsMultipleChoices}
        onChange={card.setMultipleChoices}
        disabled={card.isChoiceModeLocked}
      />
      <KkSwitchRow
        label={ANONYMOUS_LABEL}
        checked={poll.isAnonymous}
        onChange={card.setAnonymous}
        disabled={card.isAnonymityLocked}
      />
      <KkFormPair
        balance="leading"
        start={
          <KkDateField
            name={card.fieldNames.votesUntilDay}
            label={DEADLINE_DAY_LABEL}
            value={poll.votesUntilDay}
            onChange={card.setVotesUntilDay}
            allowEmpty
            emptyLabel={DEADLINE_EMPTY_LABEL}
            disabled={card.isDeadlineLocked}
          />
        }
        end={
          <KkTimeField
            name={card.fieldNames.votesUntilTime}
            label={DEADLINE_TIME_LABEL}
            value={poll.votesUntilTime}
            onChange={card.setVotesUntilTime}
            disabled={card.isDeadlineTimeLocked}
            error={card.deadlineError.hasError}
            helperText={card.deadlineError.text}
          />
        }
      />
    </KkAddOnCard>
  );
};
