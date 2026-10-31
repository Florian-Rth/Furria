import { KkTenureChainRow } from '@furria/ui/KkTenureChainRow';
import type { FC } from 'react';
import { formatPeriod } from '@/lib/membership-labels';
import type { HoldingTask } from '../hooks/use-holding-form-target';
import { toPersonName } from '../manage-roles-labels';
import { HOLDING_ENDED_LABEL } from '../roles-hub-copy';
import type { RoleHolder } from '../schemas';
import { HoldingTaskButtons } from './HoldingTaskButtons';

interface RolePastRowProps {
  holder: RoleHolder;
  editable: boolean;
  onTask: (roleHoldingId: number, task: HoldingTask) => void;
}

export const RolePastRow: FC<RolePastRowProps> = ({ holder, editable, onTask }) => {
  const name = toPersonName(holder);
  const span = formatPeriod(holder.sinceOn, holder.untilOn);
  const action = editable ? (
    <HoldingTaskButtons roleHoldingId={holder.roleHoldingId} endable={false} onTask={onTask} />
  ) : undefined;

  return (
    <KkTenureChainRow
      name={name}
      span={span}
      state="past"
      stateLabel={HOLDING_ENDED_LABEL}
      action={action}
    />
  );
};
