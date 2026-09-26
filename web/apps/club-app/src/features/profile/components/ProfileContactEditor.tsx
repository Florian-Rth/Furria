import { KkNote } from '@furria/ui';
import type { FC } from 'react';
import { PROFILE_ORIGIN } from '@/features/session';
import { WriteScreen } from '@/features/write';
import type { MePerson } from '@/lib/api/schemas';
import { useContactDetailsEditor } from '../hooks/use-contact-details-editor';
import { CONTACT_DETAILS_EDIT_TITLE, toOwnContactChangeNote } from '../profile-labels';
import { ProfileContactFields } from './ProfileContactFields';

const SAVE_LABEL = 'Speichern';

interface ProfileContactEditorProps {
  person: MePerson;
}

export const ProfileContactEditor: FC<ProfileContactEditorProps> = ({ person }) => {
  const control = useContactDetailsEditor(person);
  const changeNote = toOwnContactChangeNote(person.contactChange, person.id, new Date());
  const changeLine = changeNote === undefined ? null : <KkNote>{changeNote}</KkNote>;

  return (
    <WriteScreen
      origin={PROFILE_ORIGIN}
      title={CONTACT_DETAILS_EDIT_TITLE}
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
      {changeLine}
      <ProfileContactFields form={control.form} errors={control.errors} />
    </WriteScreen>
  );
};
