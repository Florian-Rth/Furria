import type { KkScreenActionBar } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { LOGIN_EMAIL_EDIT_TITLE, SECURITY_ORIGIN } from '../account-security-labels';
import { useLoginEmailEditor } from '../hooks/use-login-email-editor';
import { LoginEmailAddressFields } from './LoginEmailAddressFields';
import { LoginEmailCodeFields } from './LoginEmailCodeFields';

const SEND_CODE_LABEL = 'Code senden';
const SAVE_LABEL = 'Speichern';
const RESEND_LABEL = 'Neuen Code senden';

interface LoginEmailEditorProps {
  currentLoginEmail: string;
}

export const LoginEmailEditor: FC<LoginEmailEditorProps> = ({ currentLoginEmail }) => {
  const control = useLoginEmailEditor(currentLoginEmail);
  const { step } = control;

  const addressAction: KkScreenActionBar = {
    primary: {
      label: SEND_CODE_LABEL,
      onSelect: control.submit,
      loading: control.isSending,
      disabled: !control.canSubmit,
    },
  };
  const codeAction: KkScreenActionBar = {
    primary: {
      label: SAVE_LABEL,
      onSelect: control.submit,
      loading: control.isConfirming,
      disabled: !control.canSubmit || control.isSending,
    },
    secondary: {
      label: RESEND_LABEL,
      onSelect: control.resend,
      loading: control.isSending,
      disabled: control.isConfirming,
    },
  };

  const action = step.kind === 'address' ? addressAction : codeAction;
  const fields =
    step.kind === 'address' ? (
      <LoginEmailAddressFields
        form={control.addressForm}
        contactEmailFollows={control.contactEmailFollows}
        currentLoginEmail={currentLoginEmail}
      />
    ) : (
      <LoginEmailCodeFields
        form={control.codeForm}
        loginEmail={step.loginEmail}
        expiresAt={step.expiresAt}
        hasResentCode={control.hasResentCode}
        isBusy={control.isConfirming || control.isSending}
        onEditAddress={control.editAddress}
      />
    );

  return (
    <WriteScreen
      origin={SECURITY_ORIGIN}
      title={LOGIN_EMAIL_EDIT_TITLE}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={action}
    >
      {fields}
    </WriteScreen>
  );
};
