import type { FC } from 'react';
import { useEventQuery } from '@/features/events/api';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { PAGE_TITLE } from '../planner-copy';
import { runningOrderOriginOf } from '../running-order-origin';
import { RunningOrderScreen } from './RunningOrderScreen';

const PLANNERS = [PERMISSION_KEYS.eventsRunningOrder, PERMISSION_KEYS.eventsManage] as const;

interface RunningOrderPageProps {
  eventId: string;
}

export const RunningOrderPage: FC<RunningOrderPageProps> = ({ eventId }) => {
  const id = parsePositiveId(eventId);
  const event = useEventQuery(id);

  if (id === null) {
    return <ScreenNotFound />;
  }

  const origin = runningOrderOriginOf(id, event.data?.title);

  return (
    <RequireAnyScreenPermission permissionKeys={PLANNERS} title={PAGE_TITLE} origin={origin}>
      <RunningOrderScreen eventId={id} />
    </RequireAnyScreenPermission>
  );
};
