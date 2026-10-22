import { KkButton } from '@furria/ui/KkButton';
import type { KkSeatTone } from '@furria/ui/KkSeatLine';
import { KkSeatLine } from '@furria/ui/KkSeatLine';
import type { FC } from 'react';
import { toAvatarHonours } from '@/lib/honours';
import { toInitials } from '@/lib/initials';
import { toPersonName } from '../manage-roles-labels';
import type { HolderPhase } from '../roles-hub';
import { holderPhaseOf } from '../roles-hub';
import { END_HOLDING_LABEL, toHolderPeriod } from '../roles-hub-copy';
import type { RoleHolder } from '../schemas';

const PHASE_TONES: Record<HolderPhase, KkSeatTone> = {
  running: 'ink',
  ending: 'attention',
  planned: 'planned',
  past: 'past',
};

interface RoleHolderLineProps {
  holder: RoleHolder;
  today: string;
  canEnd: boolean;
  onEnd: (roleHoldingId: number) => void;
}

export const RoleHolderLine: FC<RoleHolderLineProps> = ({ holder, today, canEnd, onEnd }) => {
  const phase = holderPhaseOf(holder, today);
  const end = (): void => {
    onEnd(holder.roleHoldingId);
  };
  const action =
    canEnd && phase === 'running' ? (
      <KkButton size="small" variant="text" onClick={end}>
        {END_HOLDING_LABEL}
      </KkButton>
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
