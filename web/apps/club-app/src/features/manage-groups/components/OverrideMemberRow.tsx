import { KkButton, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import type { ManagedMember } from '../schemas';

const SINCE_LABEL = 'seit';
const END_LABEL = 'Beenden';

interface OverrideMemberRowProps {
  member: ManagedMember;
  canManage: boolean;
  onEnd: (groupMembershipId: number) => void;
}

export const OverrideMemberRow: FC<OverrideMemberRowProps> = ({ member, canManage, onEnd }) => {
  const name = `${member.firstName} ${member.lastName}`;

  const end = (): void => {
    onEnd(member.groupMembershipId);
  };

  const action = canManage ? (
    <KkButton size="small" variant="outlined" tone="danger" onClick={end}>
      {END_LABEL}
    </KkButton>
  ) : null;

  return (
    <KkSinceRow
      icon="person"
      title={name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(member.since)}
      trailing={action}
    />
  );
};
