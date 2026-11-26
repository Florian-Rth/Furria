import type { KkScreenActionBar } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { WriteScreen } from '@/features/write/WriteScreen';
import { PASSWORD_EDIT_TITLE, SECURITY_ORIGIN } from '../account-security-labels';
import { usePasswordEditor } from '../hooks/use-password-editor';
import { PasswordFields } from './PasswordFields';
import { PasswordHelp } from './PasswordHelp';

const SAVE_LABEL = 'Speichern';
const CONSEQUENCE = 'Auf deinen anderen Geräten wirst du abgemeldet.';
const PASSWORD_HELP = toScreenHelp(<PasswordHelp />);

interface PasswordEditorProps {
  loginEmail: string;
}

export const PasswordEditor: FC<PasswordEditorProps> = ({ loginEmail }) => {
  const control = usePasswordEditor();

  const action: KkScreenActionBar = {
    context: { text: CONSEQUENCE, tone: 'consequence' },
    primary: {
      label: SAVE_LABEL,
      onSelect: control.submit,
      loading: control.isSaving,
      disabled: !control.canSubmit,
    },
  };

  return (
    <WriteScreen
      origin={SECURITY_ORIGIN}
      title={PASSWORD_EDIT_TITLE}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      help={PASSWORD_HELP}
      action={action}
    >
      <PasswordFields form={control.form} errors={control.errors} loginEmail={loginEmail} />
    </WriteScreen>
  );
};
