import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { SystemStatus } from '../schemas';
import { AREAS_TITLE } from '../system-copy';
import type { SystemMoment } from '../system-view';
import { areaRowsOf } from '../system-view';

interface SystemAreaListProps {
  status: SystemStatus;
  moment: SystemMoment;
}

export const SystemAreaList: FC<SystemAreaListProps> = ({ status, moment }) => {
  const rows = areaRowsOf(status, moment).map((row) => (
    <KkHubRow
      key={row.area}
      label={row.label}
      icon={row.icon}
      meta={row.meta}
      hint={row.hint}
      hintTone={row.hintTone}
      component={Link}
      to={row.to}
    />
  ));

  return (
    <KkPanelSection title={AREAS_TITLE}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
