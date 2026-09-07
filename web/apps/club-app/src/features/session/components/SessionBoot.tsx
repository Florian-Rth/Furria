import type { FC, PropsWithChildren } from 'react';
import { restoreSession } from '@/lib/api/session/session-store';
import { useSessionSnapshot } from '../hooks/use-session-snapshot';
import { BootFailure } from './BootFailure';
import { BootStage } from './BootStage';

export const SessionBoot: FC<PropsWithChildren> = ({ children }) => {
  const { status } = useSessionSnapshot();

  const retryBoot = (): void => {
    void restoreSession();
  };

  if (status === 'restoring') {
    return <BootStage />;
  }
  if (status === 'unavailable') {
    return <BootFailure onRetry={retryBoot} />;
  }

  return children;
};
