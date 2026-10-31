import type { KkSeatTone } from '@furria/ui/KkSeatLine';
import { KkSeatLine } from '@furria/ui/KkSeatLine';
import type { FC } from 'react';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import type { HoldingTask } from '../hooks/use-holding-form-target';
import { toPersonName } from '../manage-roles-labels';
import type { HolderPhase } from '../roles-hub';
import { holderPhaseOf } from '../roles-hub';
import { toHolderPeriod } from '../roles-hub-copy';
import type { RoleHolder } from '../schemas';
import { HoldingTaskButtons } from './HoldingTaskButtons';

const PHASE_TONES: Record<HolderPhase, KkSeatTone> = {
  running: 'ink',
  ending: 'attention',
  planned: 'planned',
  past: 'past',
};

interface RoleHolderLineProps {
  holder: RoleHolder;
  today: string;
  editable: boolean;
  onTask: (roleHoldingId: number, task: HoldingTask) => void;
}

export const RoleHolderLine: FC<RoleHolderLineProps> = ({ holder, today, editable, onTask }) => {
  const phase = holderPhaseOf(holder, today);
  const action = editable ? (
    <HoldingTaskButtons
      roleHoldingId={holder.roleHoldingId}
      endable={phase === 'running'}
      onTask={onTask}
    />
  ) : undefined;
  const initials = toInitials(holder.firstName, holder.lastName);
  const honours = toAvatarHonours(holder.honours);
  const name = toPersonName(holder);
  const period = toHolderPeriod(holder, phase);

  return (
    <KkSeatLine
      initials={initials}
      honours={honours}
      name={name}
      period={period}
      tone={PHASE_TONES[phase]}
      action={action}
    />
  );
};
