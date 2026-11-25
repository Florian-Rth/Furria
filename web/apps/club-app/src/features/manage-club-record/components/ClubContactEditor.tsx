import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { WriteScreen } from '@/features/write/WriteScreen';
import { CLUB_RECORD_ORIGIN, CLUB_RECORD_SECTION_TITLES } from '../club-record-labels';
import { useClubContactEditor } from '../hooks/use-club-contact-editor';
import type { ClubRecord } from '../schemas';
import { ClubContactFields } from './ClubContactFields';
import { ClubContactHelp } from './ClubContactHelp';

const SAVE_LABEL = 'Speichern';

interface ClubContactEditorProps {
  record: ClubRecord;
}

export const ClubContactEditor: FC<ClubContactEditorProps> = ({ record }) => {
  const help = toScreenHelp(<ClubContactHelp />);
  const control = useClubContactEditor(record);

  return (
    <WriteScreen
      origin={CLUB_RECORD_ORIGIN}
      title={CLUB_RECORD_SECTION_TITLES.contact}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      help={help}
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
