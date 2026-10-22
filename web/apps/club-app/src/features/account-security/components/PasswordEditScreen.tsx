import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session/api';
import { PASSWORD_EDIT_TITLE, SECURITY_ORIGIN } from '../account-security-labels';
import { toSecurityErrorMessage } from '../account-security-messages';
import { AccountSecurityError } from './AccountSecurityError';
import { AccountSecuritySkeleton } from './AccountSecuritySkeleton';
import { PasswordEditor } from './PasswordEditor';

export const PasswordEditScreen: FC = () => {
  const me = useMeQuery();
  const errorMessage = toSecurityErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (me.data !== undefined) {
    return <PasswordEditor loginEmail={me.data.email} />;
  }

  const content =
    errorMessage === null ? (
      <AccountSecuritySkeleton />
    ) : (
      <AccountSecurityError message={errorMessage} retrying={me.isFetching} onRetry={reload} />
    );

  return (
    <KkScreen kind="fullscreen" title={PASSWORD_EDIT_TITLE} origin={SECURITY_ORIGIN}>
      {content}
    </KkScreen>
  );
};
