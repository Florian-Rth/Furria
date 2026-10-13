import type { FC } from 'react';
import type { SystemStatusRead } from '../hooks/use-system-status';
import { SystemLogSection } from './SystemLogSection';

interface SystemLogAreaProps {
  read: SystemStatusRead;
}

export const SystemLogArea: FC<SystemLogAreaProps> = ({ read }) => {
  const shown = read.kind === 'shown' ? read : null;
  const logsSince = shown?.status.logsSince ?? null;
  const dimmed = shown !== null && !shown.moment.isConnected;

  return <SystemLogSection logsSince={logsSince} nowMs={read.nowMs} dimmed={dimmed} />;
};
