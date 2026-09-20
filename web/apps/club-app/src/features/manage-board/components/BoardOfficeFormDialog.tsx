import { KkAlert, KkButton, KkModalFrame, KkNote, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import { useBoardOfficeForm } from '../hooks/use-board-office-form';
import type { BoardOfficeEntry } from '../manage-board-labels';

const CREATE_TITLE = 'Vorstandsfunktion anlegen';
const EDIT_TITLE = 'Vorstandsfunktion umbenennen';
const CREATE_KICKER = 'Neue Funktion';
const CREATE_EXPLANATION =
  'Eine Vorstandsfunktion ist ein Posten im Vorstand — Präsident, Kassenwart, Beisitzer. Wer darin sitzt, trägst du danach ein.';
const EDIT_EXPLANATION =
  'Name und Platz stehen so im Vorstand. Die Sitze bleiben, wie sie sind — auch nach einer Umbenennung.';
const NAME_LABEL = 'Name';
const SORT_ORDER_LABEL = 'Platz im Vorstand';
const SORT_ORDER_HINT =
  'Kleinere Zahlen stehen weiter vorn. Der Platz bleibt über jede Wahl hinweg.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CREATE_CONFIRM_LABEL = 'Anlegen';
const EDIT_CONFIRM_LABEL = 'Speichern';
const EMPTY_FORM = { name: '', sortOrder: '1' };

interface BoardOfficeFormDialogProps {
  open: boolean;
  editedOffice: BoardOfficeEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

export const BoardOfficeFormDialog: FC<BoardOfficeFormDialogProps> = ({
  open,
  editedOffice,
  onClose,
  onSaved,
}) => {
  const titleId = useId();
  const initial =
    editedOffice === null
      ? EMPTY_FORM
      : { name: editedOffice.name, sortOrder: String(editedOffice.sortOrder) };
  const control = useBoardOfficeForm({
    boardOfficeId: editedOffice?.boardOfficeId ?? null,
    open,
    initial,
    onSaved,
  });
  const { errors } = control.form.formState;

  const kicker = editedOffice === null ? CREATE_KICKER : editedOffice.name;
  const title = editedOffice === null ? CREATE_TITLE : EDIT_TITLE;
  const explanation = editedOffice === null ? CREATE_EXPLANATION : EDIT_EXPLANATION;
  const confirmLabel = editedOffice === null ? CREATE_CONFIRM_LABEL : EDIT_CONFIRM_LABEL;

  const nameField = control.form.register('name');
  const sortOrderField = control.form.register('sortOrder');

  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{kicker}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{title}</KkModalFrame.Title>
      <KkModalFrame.Body>
        <KkNote>{explanation}</KkNote>
      </KkModalFrame.Body>
      <KkModalFrame.Fields>
        <KkTextField
          name={nameField.name}
          label={NAME_LABEL}
          inputRef={nameField.ref}
          onChange={nameField.onChange}
          onBlur={nameField.onBlur}
          error={errors.name !== undefined}
          helperText={errors.name?.message}
        />
        <KkTextField
          name={sortOrderField.name}
          label={SORT_ORDER_LABEL}
          inputMode="numeric"
          inputRef={sortOrderField.ref}
          onChange={sortOrderField.onChange}
          onBlur={sortOrderField.onBlur}
          error={errors.sortOrder !== undefined}
          helperText={errors.sortOrder?.message ?? SORT_ORDER_HINT}
        />
      </KkModalFrame.Fields>
      <KkModalFrame.Footer>
        {rejection}
        <KkButton variant="outlined" onClick={onClose} disabled={control.isSaving}>
          {CANCEL_LABEL}
        </KkButton>
        <KkButton onClick={control.submit} loading={control.isSaving}>
          {confirmLabel}
        </KkButton>
      </KkModalFrame.Footer>
    </KkModalFrame>
  );
};
