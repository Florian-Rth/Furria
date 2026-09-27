import type { KkScreenActionBar } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { PASSWORD_EDIT_TITLE, SECURITY_ORIGIN } from '../account-security-labels';
import { usePasswordEditor } from '../hooks/use-password-editor';
import { PasswordFields } from './PasswordFields';

const SAVE_LABEL = 'Speichern';
const CONSEQUENCE = 'Auf deinen anderen Geräten wirst du abgemeldet.';

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
      action={action}
    >
      <PasswordFields form={control.form} errors={control.errors} loginEmail={loginEmail} />
    </WriteScreen>
  );
};
