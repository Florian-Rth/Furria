import { KkSignUpSheet } from '@furria/ui/KkSignUpSheet';
import type { FC } from 'react';
import { SIGN_UP_LINE_TEXT_MAX_LENGTH } from '../calendar-sign-up-lists';
import type { CalendarSignUpListControl } from '../hooks/use-calendar-sign-up-list';

const OWN_LABEL = 'Du';
const FIELD_LABEL = 'Dein Eintrag';
const EDIT_LABEL = 'Ändern';
const CANCEL_LABEL = 'Abbrechen';
const DELETE_LABEL = 'Austragen';

interface CalendarSignUpOwnBoxProps {
  control: CalendarSignUpListControl;
  fieldName: string;
}

export const CalendarSignUpOwnBox: FC<CalendarSignUpOwnBoxProps> = ({ control, fieldName }) => {
  if (control.ownBox === 'hidden') {
    return null;
  }

  const isEditing = control.ownBox === 'editing';
  const cancelLabel = isEditing ? CANCEL_LABEL : undefined;
  const removeLabel = isEditing ? DELETE_LABEL : undefined;
  const editLabel = control.ownBox === 'line' ? EDIT_LABEL : undefined;
  const isField = control.ownBox === 'entry' || isEditing;
  const content = isField ? (
    <KkSignUpSheet.Entry
      name={fieldName}
      label={FIELD_LABEL}
      value={control.draft}
      maxLength={SIGN_UP_LINE_TEXT_MAX_LENGTH}
      saveLabel={control.saveLabel}
      canSave={control.canSave}
      saving={control.isBusy}
      autoFocus={isEditing}
      cancelLabel={cancelLabel}
      removeLabel={removeLabel}
      onChange={control.setDraft}
      onSave={control.save}
      onCancel={control.cancelEdit}
      onRemove={control.deleteOwnLine}
    />
  ) : (
    <KkSignUpSheet.OwnLine text={control.ownText} actionLabel={editLabel} onAction={control.edit} />
  );

  return <KkSignUpSheet.Own label={OWN_LABEL}>{content}</KkSignUpSheet.Own>;
};
