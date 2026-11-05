import { KkTextArea } from '@furria/ui/KkTextArea';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import { NOTE_MAX_LENGTH, NUMBER_MAX_LENGTH } from '@/features/hall-plan/schemas';
import { useDraftText } from '../hooks/use-draft-text';
import { NOTE_FIELD_HINT, NOTE_FIELD_LABEL, NUMBER_FIELD_LABEL } from '../table-planner-copy';

const NOTE_ROWS = 3;

interface TablePlannerTextFieldsProps {
  number: string | null;
  note: string | null;
  onNumber: (text: string) => void;
  onNote: (text: string) => void;
}

export const TablePlannerTextFields: FC<TablePlannerTextFieldsProps> = ({
  number,
  note,
  onNumber,
  onNote,
}) => {
  const numberDraft = useDraftText(number, onNumber);
  const noteDraft = useDraftText(note, onNote);
  const changeNumber = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    numberDraft.change(event.target.value);
  };

  return (
    <>
      <KkTextField
        name="number"
        label={NUMBER_FIELD_LABEL}
        value={numberDraft.value}
        maxLength={NUMBER_MAX_LENGTH}
        onChange={changeNumber}
      />
      <KkTextArea
        name="note"
        label={NOTE_FIELD_LABEL}
        hint={NOTE_FIELD_HINT}
        value={noteDraft.value}
        rows={NOTE_ROWS}
        maxLength={NOTE_MAX_LENGTH}
        onChange={noteDraft.change}
      />
    </>
  );
};
