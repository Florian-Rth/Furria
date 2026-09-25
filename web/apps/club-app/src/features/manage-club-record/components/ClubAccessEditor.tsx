import { KkConsequenceNote, KkSelectField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import {
  AGE_OF_CONSENT_OPTIONS,
  CLUB_RECORD_ORIGIN,
  CLUB_RECORD_SECTION_TITLES,
  toAgeConsequence,
} from '../club-record-labels';
import { useClubAccessEditor } from '../hooks/use-club-access-editor';
import type { ClubRecord } from '../schemas';

const SAVE_LABEL = 'Speichern';
const AGE_LABEL = 'Mindestalter für einen Zugang';
const AGE_HINT = 'Ab diesem Alter kann eine Person die App nutzen.';

const FIELD_GAP = 2.25;

interface ClubAccessEditorProps {
  record: ClubRecord;
}

export const ClubAccessEditor: FC<ClubAccessEditorProps> = ({ record }) => {
  const control = useClubAccessEditor(record);
  const consequence = toAgeConsequence(control.ageOfConsent);

  return (
    <WriteScreen
      origin={CLUB_RECORD_ORIGIN}
      title={CLUB_RECORD_SECTION_TITLES.access}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: { label: SAVE_LABEL, onSelect: control.submit, loading: control.isSaving },
      }}
    >
      <Stack sx={{ gap: FIELD_GAP, minWidth: 0 }}>
        <KkSelectField
          name="ageOfConsent"
          label={AGE_LABEL}
          value={control.ageOfConsent}
          options={AGE_OF_CONSENT_OPTIONS}
          onChange={control.setAgeOfConsent}
          presentation="select"
          hint={AGE_HINT}
        />
        <KkConsequenceNote>{consequence}</KkConsequenceNote>
      </Stack>
    </WriteScreen>
  );
};
