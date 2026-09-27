import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { ScreenNotFound, useMeQuery } from '@/features/session';
import { SECURITY_ORIGIN } from '../account-security-labels';
import { toSecurityErrorMessage } from '../account-security-messages';
import { AccountSecurityError } from './AccountSecurityError';
import { AccountSecuritySkeleton } from './AccountSecuritySkeleton';
import { PasskeyPanels } from './PasskeyPanels';

const LOADING_TITLE = 'Passkey';

interface PasskeyScreenProps {
  passkeyId: string;
}

export const PasskeyScreen: FC<PasskeyScreenProps> = ({ passkeyId }) => {
  const me = useMeQuery();
  const errorMessage = toSecurityErrorMessage(me.error);
  const passkey = me.data?.passkeys.find((candidate) => candidate.id === passkeyId);

  const reload = (): void => {
    void me.refetch();
  };

  if (me.data !== undefined && passkey === undefined) {
    return <ScreenNotFound />;
  }
  if (passkey !== undefined) {
    return (
      <KkScreen kind="detail" title={passkey.name} origin={SECURITY_ORIGIN}>
        <PasskeyPanels passkey={passkey} />
      </KkScreen>
    );
  }

  const content =
    errorMessage === null ? (
      <AccountSecuritySkeleton />
    ) : (
      <AccountSecurityError message={errorMessage} onRetry={reload} />
    );

  return (
    <KkScreen kind="detail" title={LOADING_TITLE} origin={SECURITY_ORIGIN}>
      {content}
    </KkScreen>
  );
};
