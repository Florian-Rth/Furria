import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkTextArea } from '@furria/ui/KkTextArea';
import { KkTextField } from '@furria/ui/KkTextField';
import { KkTimeField } from '@furria/ui/KkTimeField';
import type { ChangeEvent, FC } from 'react';
import type { AddOnCardsEditor } from '../add-on-cards-editor';
import { CALENDAR_ADD_ON_ICONS, CALENDAR_ADD_ON_LABELS } from '../calendar-add-ons';
import { hasNoDeadline } from '../calendar-deadlines';
import {
  SIGN_UP_LIST_HINT_MAX_LENGTH,
  SIGN_UP_LIST_TITLE_MAX_LENGTH,
} from '../calendar-sign-up-lists';
import { useCalendarSignUpListCard } from '../hooks/use-calendar-sign-up-list-card';
import type { CalendarEntryAddOn, CalendarSignUpListForm } from '../schemas';

const TITLE_LABEL = 'Titel';
const HINT_LABEL = 'Hinweis';
const DEADLINE_DAY_LABEL = 'Eintragen bis';
const DEADLINE_TIME_LABEL = 'Uhrzeit';
const HINT_ROWS = 2;

interface CalendarSignUpListCardProps {
  cardKey: string;
  index: number;
  list: CalendarSignUpListForm;
  editor: AddOnCardsEditor;
  held: readonly CalendarEntryAddOn[] | null;
  deadlineEmptyLabel?: string;
  withHint?: boolean;
  onRemove: () => void;
}

export const CalendarSignUpListCard: FC<CalendarSignUpListCardProps> = ({
  cardKey,
  index,
  list,
  editor,
  held,
  deadlineEmptyLabel,
  withHint = true,
  onRemove,
}) => {
  const card = useCalendarSignUpListCard({ editor, cardKey, index, list, held });

  const changeTitle = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    card.setTitle(event.target.value);
  };

  const hintField = withHint ? (
    <KkTextArea
      name={card.fieldNames.hint}
      label={HINT_LABEL}
      value={list.hint}
      rows={HINT_ROWS}
      readOnly={card.isFrozen}
      maxLength={SIGN_UP_LIST_HINT_MAX_LENGTH}
      error={card.hintError.hasError}
      helperText={card.hintError.text}
      onChange={card.setHint}
    />
  ) : null;
  const deadlineTime = hasNoDeadline(list.signUpUntilDay) ? null : (
    <KkTimeField
      name={card.fieldNames.signUpUntilTime}
      label={DEADLINE_TIME_LABEL}
      value={list.signUpUntilTime}
      onChange={card.setSignUpUntilTime}
      disabled={card.isDeadlineTimeLocked}
      error={card.deadlineError.hasError}
      helperText={card.deadlineError.text}
    />
  );

  return (
    <KkAddOnCard
      icon={CALENDAR_ADD_ON_ICONS.signUpList}
      title={CALENDAR_ADD_ON_LABELS.signUpList}
      meta={card.metaLabel}
      removeLabel={card.removeLabel}
      onRemove={onRemove}
    >
      <KkTextField
        name={card.fieldNames.title}
        label={TITLE_LABEL}
        required
        readOnly={card.isFrozen}
        value={list.title}
        maxLength={SIGN_UP_LIST_TITLE_MAX_LENGTH}
        error={card.titleError.hasError}
        helperText={card.titleError.text}
        onChange={changeTitle}
      />
      {hintField}
      <KkFormPair
        balance="leading"
        start={
          <KkDateField
            name={card.fieldNames.signUpUntilDay}
            label={DEADLINE_DAY_LABEL}
            value={list.signUpUntilDay}
            onChange={card.setSignUpUntilDay}
            allowEmpty
            emptyLabel={deadlineEmptyLabel}
            disabled={card.isFrozen}
          />
        }
        end={deadlineTime}
      />
    </KkAddOnCard>
  );
};
