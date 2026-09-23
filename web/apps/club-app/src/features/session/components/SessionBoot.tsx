import { KkButton } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { restoreSession } from '@/lib/api/session/session-store';
import { useSessionSnapshot } from '../hooks/use-session-snapshot';
import { BOOT_FAILURE_MESSAGE, BOOT_RETRY_LABEL } from '../session-messages';
import { BootStage } from './BootStage';
import { StageFailure } from './StageFailure';

export const SessionBoot: FC<PropsWithChildren> = ({ children }) => {
  const { status } = useSessionSnapshot();

  const retryBoot = (): void => {
    void restoreSession();
  };

  const retry = (
    <KkButton variant="outlined" onClick={retryBoot}>
      {BOOT_RETRY_LABEL}
    </KkButton>
  );

  if (status === 'restoring') {
    return <BootStage />;
  }
  if (status === 'unavailable') {
    return <StageFailure message={BOOT_FAILURE_MESSAGE} action={retry} />;
  }

  return children;
};
