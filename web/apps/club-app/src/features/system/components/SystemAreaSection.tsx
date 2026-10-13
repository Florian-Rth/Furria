import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import type { SystemMoment } from '../system-view';
import type { SystemArea } from '../types';
import { SystemDatabaseSection } from './SystemDatabaseSection';
import { SystemLogSection } from './SystemLogSection';
import { SystemMailSection } from './SystemMailSection';
import { SystemMediaSection } from './SystemMediaSection';
import { SystemServicesSection } from './SystemServicesSection';
import { SystemStorageSection } from './SystemStorageSection';

interface SystemAreaSectionProps {
  area: SystemArea;
  status: SystemStatus;
  moment: SystemMoment;
}

export const SystemAreaSection: FC<SystemAreaSectionProps> = ({ area, status, moment }) => {
  const dimmed = !moment.isConnected;

  switch (area) {
    case 'media':
      return <SystemMediaSection status={status} nowMs={moment.nowMs} dimmed={dimmed} />;
    case 'storage':
      return <SystemStorageSection status={status} nowMs={moment.nowMs} dimmed={dimmed} />;
    case 'services':
      return <SystemServicesSection status={status} nowMs={moment.nowMs} dimmed={dimmed} />;
    case 'database':
      return <SystemDatabaseSection status={status} dimmed={dimmed} />;
    case 'mail':
      return <SystemMailSection status={status} nowMs={moment.nowMs} dimmed={dimmed} />;
    case 'log':
      return <SystemLogSection logsSince={status.logsSince} nowMs={moment.nowMs} dimmed={dimmed} />;
  }
};
