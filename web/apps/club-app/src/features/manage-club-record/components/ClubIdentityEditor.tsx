import { KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { CLUB_RECORD_ORIGIN, CLUB_RECORD_SECTION_TITLES } from '../club-record-labels';
import { useClubIdentityEditor } from '../hooks/use-club-identity-editor';
import type { ClubRecord } from '../schemas';

const SAVE_LABEL = 'Speichern';
const NAME_LABEL = 'Vereinsname';
const NAME_HINT = 'So wie im Vereinsregister, mit „e.V.“.';
const SHORT_NAME_LABEL = 'Kurzname';
const SHORT_NAME_HINT = 'Für knappe Stellen, zum Beispiel „GCC“.';
const FOUNDED_LABEL = 'Gründungsjahr';
const FOUNDED_HINT = 'Nur die Jahreszahl.';

const FIELD_GAP = 2.25;

interface ClubIdentityEditorProps {
  record: ClubRecord;
}

export const ClubIdentityEditor: FC<ClubIdentityEditorProps> = ({ record }) => {
  const control = useClubIdentityEditor(record);
  const name = control.form.register('name');
  const shortName = control.form.register('shortName');
  const foundedYear = control.form.register('foundedYear');

  const nameError = control.errors.name?.message;
  const shortNameError = control.errors.shortName?.message;
  const foundedYearError = control.errors.foundedYear?.message;

  return (
    <WriteScreen
      origin={CLUB_RECORD_ORIGIN}
      title={CLUB_RECORD_SECTION_TITLES.identity}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: SAVE_LABEL,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <Stack sx={{ gap: FIELD_GAP, minWidth: 0 }}>
        <KkTextField
          name={name.name}
          label={NAME_LABEL}
          autoComplete="organization"
          error={nameError !== undefined}
          helperText={nameError ?? NAME_HINT}
          onChange={name.onChange}
          onBlur={name.onBlur}
          inputRef={name.ref}
        />
        <KkTextField
          name={shortName.name}
          label={SHORT_NAME_LABEL}
          error={shortNameError !== undefined}
          helperText={shortNameError ?? SHORT_NAME_HINT}
          onChange={shortName.onChange}
          onBlur={shortName.onBlur}
          inputRef={shortName.ref}
        />
        <KkTextField
          name={foundedYear.name}
          label={FOUNDED_LABEL}
          inputMode="numeric"
          error={foundedYearError !== undefined}
          helperText={foundedYearError ?? FOUNDED_HINT}
          onChange={foundedYear.onChange}
          onBlur={foundedYear.onBlur}
          inputRef={foundedYear.ref}
        />
      </Stack>
    </WriteScreen>
  );
};
