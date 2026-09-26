import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session';
import { LOGIN_EMAIL_EDIT_TITLE, SECURITY_ORIGIN } from '../account-security-labels';
import { toSecurityErrorMessage } from '../account-security-messages';
import { AccountSecurityError } from './AccountSecurityError';
import { AccountSecuritySkeleton } from './AccountSecuritySkeleton';
import { LoginEmailEditor } from './LoginEmailEditor';

export const LoginEmailEditScreen: FC = () => {
  const me = useMeQuery();
  const errorMessage = toSecurityErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (me.data !== undefined) {
    return <LoginEmailEditor currentLoginEmail={me.data.email} />;
  }

  const content =
    errorMessage === null ? (
      <AccountSecuritySkeleton />
    ) : (
      <AccountSecurityError message={errorMessage} onRetry={reload} />
    );

  return (
    <KkScreen kind="fullscreen" title={LOGIN_EMAIL_EDIT_TITLE} origin={SECURITY_ORIGIN}>
      {content}
    </KkScreen>
  );
};
