import { KkButton } from '@furria/ui/KkButton';
import type { FC, PropsWithChildren } from 'react';
import { bootSession } from '@/lib/api/session/session-boot';
import { expireSession } from '@/lib/api/session/session-store';
import { useSessionSnapshot } from '../hooks/use-session-snapshot';
import { BOOT_FAILURE_MESSAGE, BOOT_RELOGIN_LABEL, BOOT_RETRY_LABEL } from '../session-messages';
import { BootStage } from './BootStage';
import { StageFailure } from './StageFailure';

export const SessionBoot: FC<PropsWithChildren> = ({ children }) => {
  const { status } = useSessionSnapshot();

  const retryBoot = (): void => {
    void bootSession();
  };

  const actions = (
    <>
      <KkButton variant="outlined" onClick={retryBoot}>
        {BOOT_RETRY_LABEL}
      </KkButton>
      <KkButton variant="text" onClick={expireSession}>
        {BOOT_RELOGIN_LABEL}
      </KkButton>
    </>
  );

  if (status === 'restoring') {
    return <BootStage />;
  }
  if (status === 'unavailable') {
    return <StageFailure message={BOOT_FAILURE_MESSAGE} action={actions} />;
  }

  return children;
};
