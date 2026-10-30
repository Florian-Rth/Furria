import type { FC } from 'react';
import { useEventQuery } from '@/features/events/api';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { parsePositiveId } from '@/lib/positive-id';
import { PLANNER_PERMISSION_KEYS, usePlansRunningOrder } from '../hooks/use-plans-running-order';
import { PAGE_TITLE } from '../planner-copy';
import { runningOrderOriginOf } from '../running-order-origin';
import { RunningOrderScreen } from './RunningOrderScreen';

interface RunningOrderPageProps {
  eventId: string;
}

export const RunningOrderPage: FC<RunningOrderPageProps> = ({ eventId }) => {
  const id = parsePositiveId(eventId);
  const plans = usePlansRunningOrder();
  const event = useEventQuery(plans ? id : null);

  if (id === null) {
    return <ScreenNotFound />;
  }

  const origin = runningOrderOriginOf(id, event.data?.title);

  return (
    <RequireAnyScreenPermission
      permissionKeys={PLANNER_PERMISSION_KEYS}
      title={PAGE_TITLE}
      origin={origin}
    >
      <RunningOrderScreen eventId={id} />
    </RequireAnyScreenPermission>
  );
};
