import { KkConsequenceNote } from '@furria/ui/KkConsequenceNote';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { WriteScreen } from '@/features/write/WriteScreen';
import { CLUB_EDITOR_HELP_SPOTS } from '../club-record-help-copy';
import {
  AGE_OF_CONSENT_OPTIONS,
  CLUB_RECORD_ORIGIN,
  CLUB_RECORD_SECTION_TITLES,
  toAgeConsequence,
} from '../club-record-labels';
import { useClubAccessEditor } from '../hooks/use-club-access-editor';
import type { ClubRecord } from '../schemas';
import { ClubAccessHelp } from './ClubAccessHelp';

const SAVE_LABEL = 'Speichern';
const AGE_LABEL = 'Mindestalter für App und Online-Antrag';
const SECTION_TITLE = 'Mindestalter';

interface ClubAccessEditorProps {
  record: ClubRecord;
}

export const ClubAccessEditor: FC<ClubAccessEditorProps> = ({ record }) => {
  const help = toScreenHelp(<ClubAccessHelp />);
  const control = useClubAccessEditor(record);
  const consequence = toAgeConsequence(control.ageOfConsent);

  return (
    <WriteScreen
      origin={CLUB_RECORD_ORIGIN}
      title={CLUB_RECORD_SECTION_TITLES.access}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      help={help}
      action={{
        primary: { label: SAVE_LABEL, onSelect: control.submit, loading: control.isSaving },
      }}
    >
      <KkFormSection title={SECTION_TITLE} landing={CLUB_EDITOR_HELP_SPOTS.age}>
        <KkSelectField
          name="ageOfConsent"
          label={AGE_LABEL}
          value={control.ageOfConsent}
          options={AGE_OF_CONSENT_OPTIONS}
          onChange={control.setAgeOfConsent}
          presentation="select"
        />
        <KkConsequenceNote>{consequence}</KkConsequenceNote>
      </KkFormSection>
    </WriteScreen>
  );
};
