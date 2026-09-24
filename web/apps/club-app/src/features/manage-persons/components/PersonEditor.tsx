import { KkDateField, KkNote } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import type { PersonFormSource } from '../hooks/use-person-editor';
import { usePersonEditor } from '../hooks/use-person-editor';
import { PERSONS_ORIGIN, toPersonOrigin } from '../manage-persons-labels';
import { PersonFormFields } from './PersonFormFields';

const EDIT_TITLE = 'Stammdaten bearbeiten';
const CREATE_TITLE = 'Person hinzufügen';
const CREATE_NOTE =
  'Nur der Name ist Pflicht. Die Mitgliedschaft wird anschließend im Profil der Person eingetragen.';
const BIRTH_DATE_LABEL = 'Geburtsdatum';
const BIRTH_DATE_HINT = 'Nur die Personenverwaltung sieht das Geburtsdatum.';
const BIRTH_DATE_EMPTY_LABEL = 'Nicht bekannt';

interface PersonEditorProps {
  person: PersonFormSource | null;
}

export const PersonEditor: FC<PersonEditorProps> = ({ person }) => {
  const control = usePersonEditor({ person });
  const isEdit = person !== null;
  const origin = person === null ? PERSONS_ORIGIN : toPersonOrigin(person);
  const note = isEdit ? null : <KkNote>{CREATE_NOTE}</KkNote>;

  return (
    <WriteScreen
      origin={origin}
      title={isEdit ? EDIT_TITLE : CREATE_TITLE}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: control.actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      {note}
      <PersonFormFields form={control.form} errors={control.errors} />
      <KkDateField
        name="birthDate"
        label={BIRTH_DATE_LABEL}
        value={control.birthDate}
        onChange={control.setBirthDate}
        allowEmpty
        emptyLabel={BIRTH_DATE_EMPTY_LABEL}
        hint={BIRTH_DATE_HINT}
      />
    </WriteScreen>
  );
};
