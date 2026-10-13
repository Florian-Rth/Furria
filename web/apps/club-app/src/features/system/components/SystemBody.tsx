import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { useSystemStatus } from '../hooks/use-system-status';
import { SYSTEM_DENIED_MESSAGE } from '../system-copy';
import { SystemError } from './SystemError';
import { SystemOverview } from './SystemOverview';
import { SystemSkeleton } from './SystemSkeleton';

export const SystemBody: FC = () => {
  const read = useSystemStatus();

  switch (read.kind) {
    case 'loading':
      return <SystemSkeleton />;
    case 'denied':
      return <AccessDenied message={SYSTEM_DENIED_MESSAGE} />;
    case 'failed':
      return <SystemError onRetry={read.retry} />;
    case 'shown':
      return <SystemOverview status={read.status} moment={read.moment} offline={read.offline} />;
  }
};
