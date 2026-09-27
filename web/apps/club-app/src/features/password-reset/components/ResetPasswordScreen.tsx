import type { FC } from 'react';
import { SignedOutFrame } from '@/features/login';
import { usePasswordResetFragment } from '../hooks/use-password-reset-fragment';
import { useResetPassword } from '../hooks/use-reset-password';
import { ResetLinkDead } from './ResetLinkDead';
import { ResetPasswordForm } from './ResetPasswordForm';

export const ResetPasswordScreen: FC = () => {
  const reset = usePasswordResetFragment();
  const control = useResetPassword(reset);

  if (control.isDead) {
    return (
      <SignedOutFrame>
        <ResetLinkDead />
      </SignedOutFrame>
    );
  }

  return (
    <SignedOutFrame>
      <ResetPasswordForm
        form={control.form}
        isResetting={control.isResetting}
        errors={control.errors}
        onSubmit={control.submit}
        onEdit={control.clearRefusal}
      />
    </SignedOutFrame>
  );
};
