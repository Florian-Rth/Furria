import { KkChip, KkPersonRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { NO_AFFILIATION_META } from '@/lib/person-rows';
import { toMembershipStateChip } from '@/lib/state-chips';
import { toPersonRowAffiliation } from '../members-labels';
import type { MemberSummary } from '../schemas';

const MEMBERS_PATH = '/members';

interface MemberRowProps {
  member: MemberSummary;
}

export const MemberRow: FC<MemberRowProps> = ({ member }) => {
  const { accent, meta } = toPersonRowAffiliation(member.groups, member.roles);
  const state = toMembershipStateChip(member.membershipState);
  const peek = toPeekId('member', member.personId);
  const name = `${member.firstName} ${member.lastName}`;

  const stateChip = (
    <KkChip tone={state.tone} dot={state.dot} size="small">
      {state.label}
    </KkChip>
  );

  return (
    <KkPersonRow
      initials={toInitials(member.firstName, member.lastName)}
      name={name}
      accent={accent}
      meta={meta}
      emptyMeta={NO_AFFILIATION_META}
      trailing={stateChip}
      component={Link}
      to={MEMBERS_PATH}
      search={(previous) => ({ ...previous, sheet: peek })}
      resetScroll={false}
    />
  );
};
