import { KkScreen } from '@furria/ui/KkScreen';
import { KkScreenHeaderSkeleton } from '@furria/ui/KkScreenHeaderSkeleton';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session/api';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { PASSKEY_EYEBROW, SECURITY_ORIGIN } from '../account-security-labels';
import { toSecurityErrorMessage } from '../account-security-messages';
import { AccountSecurityError } from './AccountSecurityError';
import { AccountSecuritySkeleton } from './AccountSecuritySkeleton';
import { PasskeyHeader } from './PasskeyHeader';
import { PasskeyPanels } from './PasskeyPanels';

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
      <KkScreen
        kind="detail"
        title={passkey.name}
        origin={SECURITY_ORIGIN}
        header={<PasskeyHeader passkey={passkey} />}
        handover={AREA_HANDOVERS.profile}
      >
        <PasskeyPanels passkey={passkey} />
      </KkScreen>
    );
  }

  const header = errorMessage === null ? <KkScreenHeaderSkeleton /> : null;
  const content =
    errorMessage === null ? (
      <AccountSecuritySkeleton />
    ) : (
      <AccountSecurityError message={errorMessage} retrying={me.isFetching} onRetry={reload} />
    );

  return (
    <KkScreen
      kind="detail"
      title={PASSKEY_EYEBROW}
      origin={SECURITY_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.profile}
    >
      {content}
    </KkScreen>
  );
};
