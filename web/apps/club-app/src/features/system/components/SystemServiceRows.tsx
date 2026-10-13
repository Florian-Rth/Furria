import { KkTimetable } from '@furria/ui';
import type { FC } from 'react';
import { ON_DEMAND_LABEL, SERVICES_LABEL } from '../system-copy';
import type { ServiceRowView } from '../system-view';

interface SystemServiceRowsProps {
  rows: readonly ServiceRowView[];
  nowMs: number;
}

export const SystemServiceRows: FC<SystemServiceRowsProps> = ({ rows, nowMs }) => {
  const lines = rows.map((row) => (
    <KkTimetable.Row
      key={row.key}
      label={row.label}
      meta={row.meta}
      lastRunMs={row.lastRunMs}
      dueMs={row.dueMs}
      cadenceMs={row.cadenceMs}
      nowMs={nowMs}
      failed={row.state === 'failed'}
      failure={row.failure}
      onDemandLabel={ON_DEMAND_LABEL}
    />
  ));

  return <KkTimetable label={SERVICES_LABEL}>{lines}</KkTimetable>;
};
