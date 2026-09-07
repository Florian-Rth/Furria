import type { FC, PropsWithChildren } from 'react';
import { useSessionSnapshot } from '../hooks/use-session-snapshot';
import { BootStage } from './BootStage';

export const SessionBoot: FC<PropsWithChildren> = ({ children }) => {
  const { status } = useSessionSnapshot();

  if (status === 'restoring') {
    return <BootStage />;
  }

  return children;
};
