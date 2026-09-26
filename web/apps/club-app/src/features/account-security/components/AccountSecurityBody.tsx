import type { FC } from 'react';
import { useMeQuery } from '@/features/session';
import { toSecurityErrorMessage } from '../account-security-messages';
import { AccountSecurityError } from './AccountSecurityError';
import { AccountSecurityPanels } from './AccountSecurityPanels';
import { AccountSecuritySkeleton } from './AccountSecuritySkeleton';

export const AccountSecurityBody: FC = () => {
  const me = useMeQuery();
  const errorMessage = toSecurityErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (me.data !== undefined) {
    return <AccountSecurityPanels loginEmail={me.data.email} />;
  }
  if (errorMessage !== null) {
    return <AccountSecurityError message={errorMessage} onRetry={reload} />;
  }

  return <AccountSecuritySkeleton />;
};
