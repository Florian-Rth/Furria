import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormSection } from '@furria/ui/KkFormSection';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write/WriteScreen';
import { usePersonEditor } from '../hooks/use-person-editor';
import { PERSONS_ORIGIN, toPersonOrigin } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';
import { PersonAdoptionSuggestion } from './PersonAdoptionSuggestion';
import { PersonFormFields } from './PersonFormFields';
import { PersonPortraitSection } from './PersonPortraitSection';

const EDIT_TITLE = 'Stammdaten bearbeiten';
const CREATE_TITLE = 'Person hinzufügen';
const PERSONAL_SECTION_TITLE = 'Persönliches';
const BIRTH_DATE_LABEL = 'Geburtsdatum';
const BIRTH_DATE_EMPTY_LABEL = 'Nicht bekannt';

interface PersonEditorProps {
  person: PersonDetails | null;
}

export const PersonEditor: FC<PersonEditorProps> = ({ person }) => {
  const control = usePersonEditor({ person });
  const isEdit = person !== null;
  const origin = person === null ? PERSONS_ORIGIN : toPersonOrigin(person);
  const portrait = person === null ? null : <PersonPortraitSection person={person} />;
  const adoptionCandidate = control.adoption.candidate;
  const emailSuggestion =
    adoptionCandidate === null ? null : (
      <PersonAdoptionSuggestion candidate={adoptionCandidate} onAdopt={control.adoption.adopt} />
    );

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
      <PersonFormFields
        form={control.form}
        errors={control.errors}
        emailSuggestion={emailSuggestion}
      />
      <KkFormSection title={PERSONAL_SECTION_TITLE}>
        <KkDateField
          name="birthDate"
          label={BIRTH_DATE_LABEL}
          value={control.birthDate}
          onChange={control.setBirthDate}
          allowEmpty
          emptyLabel={BIRTH_DATE_EMPTY_LABEL}
        />
      </KkFormSection>
      {portrait}
    </WriteScreen>
  );
};
