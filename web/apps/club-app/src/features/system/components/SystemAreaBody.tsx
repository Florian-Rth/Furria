import { KkReadoutSkeleton } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { useSystemStatus } from '../hooks/use-system-status';
import { SECTION_TITLES, SYSTEM_DENIED_MESSAGE } from '../system-copy';
import type { SystemArea } from '../types';
import { SystemAreaSection } from './SystemAreaSection';
import { SystemError } from './SystemError';
import { SystemLogArea } from './SystemLogArea';

const LOADING_LINES = 5;

interface SystemAreaBodyProps {
  area: SystemArea;
}

export const SystemAreaBody: FC<SystemAreaBodyProps> = ({ area }) => {
  const read = useSystemStatus();

  if (area === 'log') {
    return <SystemLogArea read={read} />;
  }

  switch (read.kind) {
    case 'loading':
      return <KkReadoutSkeleton title={SECTION_TITLES[area]} lines={LOADING_LINES} />;
    case 'denied':
      return <AccessDenied message={SYSTEM_DENIED_MESSAGE} />;
    case 'failed':
      return <SystemError message={read.message} retrying={read.retrying} onRetry={read.retry} />;
    case 'shown':
      return <SystemAreaSection area={area} status={read.status} moment={read.moment} />;
  }
};
