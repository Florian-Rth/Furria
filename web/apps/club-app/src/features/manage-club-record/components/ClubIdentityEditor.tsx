import { KkFormSection } from '@furria/ui/KkFormSection';
import type { KkNumberStepLabels } from '@furria/ui/KkNumberField';
import { KkNumberField } from '@furria/ui/KkNumberField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write/WriteScreen';
import { CLUB_RECORD_ORIGIN, CLUB_RECORD_SECTION_TITLES } from '../club-record-labels';
import { useClubIdentityEditor } from '../hooks/use-club-identity-editor';
import type { ClubRecord } from '../schemas';
import { EARLIEST_FOUNDED_YEAR, LATEST_FOUNDED_YEAR } from '../schemas';

const SAVE_LABEL = 'Speichern';
const NAME_LABEL = 'Vereinsname';
const NAME_HINT = 'So wie im Vereinsregister, mit „e.V.“. Steht in der Fußzeile der Website.';
const SHORT_NAME_LABEL = 'Kurzname';
const SHORT_NAME_HINT = 'Für knappe Stellen, zum Beispiel „GCC“.';
const FOUNDED_LABEL = 'Gründungsjahr';
const FOUNDED_HINT = 'Steht in der Fußzeile der Website.';
const FOUNDED_STEP_LABELS: KkNumberStepLabels = {
  less: 'Ein Jahr früher',
  more: 'Ein Jahr später',
};
const SECTION_TITLE = 'Verein';

interface ClubIdentityEditorProps {
  record: ClubRecord;
}

export const ClubIdentityEditor: FC<ClubIdentityEditorProps> = ({ record }) => {
  const control = useClubIdentityEditor(record);
  const name = control.form.register('name');
  const shortName = control.form.register('shortName');

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
      <KkFormSection title={SECTION_TITLE}>
        <KkTextField
          name={name.name}
          label={NAME_LABEL}
          autoComplete="organization"
          error={nameError !== undefined}
          hint={NAME_HINT}
          helperText={nameError}
          onChange={name.onChange}
          onBlur={name.onBlur}
          inputRef={name.ref}
        />
        <KkTextField
          name={shortName.name}
          label={SHORT_NAME_LABEL}
          error={shortNameError !== undefined}
          hint={SHORT_NAME_HINT}
          helperText={shortNameError}
          onChange={shortName.onChange}
          onBlur={shortName.onBlur}
          inputRef={shortName.ref}
        />
        <KkNumberField
          name="foundedYear"
          label={FOUNDED_LABEL}
          value={control.foundedYear}
          onChange={control.setFoundedYear}
          stepLabels={FOUNDED_STEP_LABELS}
          min={EARLIEST_FOUNDED_YEAR}
          max={LATEST_FOUNDED_YEAR}
          hint={FOUNDED_HINT}
          error={foundedYearError !== undefined}
          helperText={foundedYearError}
        />
      </KkFormSection>
    </WriteScreen>
  );
};
