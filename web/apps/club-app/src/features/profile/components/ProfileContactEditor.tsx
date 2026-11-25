import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { PROFILE_ORIGIN } from '@/features/session/app-sections';
import { WriteScreen } from '@/features/write/WriteScreen';
import type { MePerson } from '@/lib/api/schemas';
import { useContactDetailsEditor } from '../hooks/use-contact-details-editor';
import { CONTACT_DETAILS_EDIT_TITLE, toOwnContactChangeNote } from '../profile-labels';
import { ProfileContactEditHelp } from './ProfileContactEditHelp';
import { ProfileContactFields } from './ProfileContactFields';
import { ProfilePortraitSection } from './ProfilePortraitSection';

const SAVE_LABEL = 'Speichern';
const CONTACT_EDIT_HELP = toScreenHelp(<ProfileContactEditHelp />);

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
      help={CONTACT_EDIT_HELP}
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
      <ProfilePortraitSection person={person} />
    </WriteScreen>
  );
};
