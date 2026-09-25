import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { CLUB_RECORD_ORIGIN, CLUB_RECORD_SECTION_TITLES } from '../club-record-labels';
import { useClubContactEditor } from '../hooks/use-club-contact-editor';
import type { ClubRecord } from '../schemas';
import { ClubContactFields } from './ClubContactFields';

const SAVE_LABEL = 'Speichern';

interface ClubContactEditorProps {
  record: ClubRecord;
}

export const ClubContactEditor: FC<ClubContactEditorProps> = ({ record }) => {
  const control = useClubContactEditor(record);

  return (
    <WriteScreen
      origin={CLUB_RECORD_ORIGIN}
      title={CLUB_RECORD_SECTION_TITLES.contact}
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
      <ClubContactFields form={control.form} errors={control.errors} />
    </WriteScreen>
  );
};
