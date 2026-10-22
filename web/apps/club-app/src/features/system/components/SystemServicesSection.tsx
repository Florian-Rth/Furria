import { KkPanelFold } from '@furria/ui/KkPanelFold';
import { KkReadout } from '@furria/ui/KkReadout';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import { punctualFoldOf, SECTION_TITLES } from '../system-copy';
import { servicesViewOf } from '../system-view';
import { SystemServiceRows } from './SystemServiceRows';

interface SystemServicesSectionProps {
  status: SystemStatus;
  nowMs: number;
  dimmed: boolean;
}

export const SystemServicesSection: FC<SystemServicesSectionProps> = ({
  status,
  nowMs,
  dimmed,
}) => {
  const services = servicesViewOf(status, nowMs);
  const attention =
    services.attention.length === 0 ? null : (
      <SystemServiceRows rows={services.attention} nowMs={nowMs} />
    );
  const punctual =
    services.punctual.length === 0 ? null : (
      <KkPanelFold label={punctualFoldOf(services.punctual.length)}>
        <SystemServiceRows rows={services.punctual} nowMs={nowMs} />
      </KkPanelFold>
    );

  return (
    <KkReadout label={SECTION_TITLES.services} dimmed={dimmed}>
      {attention}
      {punctual}
    </KkReadout>
  );
};
