import type { FC } from 'react';
import { useEventQuery } from '@/features/events/api';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { parsePositiveId } from '@/lib/positive-id';
import { TABLE_PLANNER_PERMISSION_KEYS, tablePlannerOriginOf } from '../planner-origin';
import { PAGE_TITLE } from '../table-planner-copy';
import { TablePlannerScreen } from './TablePlannerScreen';

interface TablePlannerPageProps {
  eventId: string;
}

export const TablePlannerPage: FC<TablePlannerPageProps> = ({ eventId }) => {
  const id = parsePositiveId(eventId);
  const permissions = usePermissions();
  const plans = TABLE_PLANNER_PERMISSION_KEYS.some((key) => permissions.has(key));
  const event = useEventQuery(plans ? id : null);

  if (id === null) {
    return <ScreenNotFound />;
  }

  return (
    <RequireAnyScreenPermission
      permissionKeys={TABLE_PLANNER_PERMISSION_KEYS}
      title={PAGE_TITLE}
      origin={tablePlannerOriginOf(id, event.data?.title)}
    >
      <TablePlannerScreen eventId={id} />
    </RequireAnyScreenPermission>
  );
};
