import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkTextArea } from '@furria/ui/KkTextArea';
import { KkTextField } from '@furria/ui/KkTextField';
import { KkTimeField } from '@furria/ui/KkTimeField';
import type { ChangeEvent, FC } from 'react';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import {
  SIGN_UP_LIST_HINT_MAX_LENGTH,
  SIGN_UP_LIST_TITLE_MAX_LENGTH,
} from '../calendar-sign-up-lists';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import { useCalendarSignUpListCard } from '../hooks/use-calendar-sign-up-list-card';
import type { CalendarEntry, CalendarSignUpListForm } from '../schemas';

const TITLE_LABEL = 'Titel';
const HINT_LABEL = 'Hinweis';
const DEADLINE_DAY_LABEL = 'Eintragen bis';
const DEADLINE_EMPTY_LABEL = 'Bis zum Beginn';
const DEADLINE_TIME_LABEL = 'Uhrzeit';
const HINT_ROWS = 2;

interface CalendarSignUpListCardProps {
  cardKey: string;
  index: number;
  list: CalendarSignUpListForm;
  control: CalendarEntryEditorControl;
  entry: CalendarEntry | null;
  onRemove: () => void;
}

export const CalendarSignUpListCard: FC<CalendarSignUpListCardProps> = ({
  cardKey,
  index,
  list,
  control,
  entry,
  onRemove,
}) => {
  const card = useCalendarSignUpListCard({ control, cardKey, index, list, entry });

  const changeTitle = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    card.setTitle(event.target.value);
  };

  return (
    <KkAddOnCard
      icon={CALENDAR_ADD_ON_ICONS.signUpList}
      title={CALENDAR_ADD_ON_LABELS.signUpList}
      meta={card.lineCountLabel}
      removeLabel={card.removeLabel}
      onRemove={onRemove}
    >
      <KkTextField
        name={card.fieldNames.title}
        label={TITLE_LABEL}
        required
        value={list.title}
        maxLength={SIGN_UP_LIST_TITLE_MAX_LENGTH}
        error={card.titleError.hasError}
        helperText={card.titleError.text}
        onChange={changeTitle}
      />
      <KkTextArea
        name={card.fieldNames.hint}
        label={HINT_LABEL}
        value={list.hint}
        rows={HINT_ROWS}
        maxLength={SIGN_UP_LIST_HINT_MAX_LENGTH}
        error={card.hintError.hasError}
        helperText={card.hintError.text}
        onChange={card.setHint}
      />
      <KkFormPair
        balance="leading"
        start={
          <KkDateField
            name={card.fieldNames.signUpUntilDay}
            label={DEADLINE_DAY_LABEL}
            value={list.signUpUntilDay}
            onChange={card.setSignUpUntilDay}
            allowEmpty
            emptyLabel={DEADLINE_EMPTY_LABEL}
          />
        }
        end={
          <KkTimeField
            name={card.fieldNames.signUpUntilTime}
            label={DEADLINE_TIME_LABEL}
            value={list.signUpUntilTime}
            onChange={card.setSignUpUntilTime}
            disabled={card.hasNoDeadline}
            error={card.deadlineError.hasError}
            helperText={card.deadlineError.text}
          />
        }
      />
    </KkAddOnCard>
  );
};
