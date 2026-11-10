import { KkChip } from '@furria/ui/KkChip';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { formatIsoDay, toMemberSinceLabel } from '@/lib/membership-labels';
import { toMembershipStateChip } from '@/lib/state-chips';
import { MEMBER_SECTION_TITLES } from '../members-labels';
import type { MemberDetails } from '../schemas';

const MEMBERSHIP_LABEL = 'Mitgliedschaft';

interface MemberClubPanelProps {
  member: MemberDetails;
}

export const MemberClubPanel: FC<MemberClubPanelProps> = ({ member }) => {
  const state = toMembershipStateChip(member.membershipState);
  const { memberSince } = member;

  const stateChip = (
    <KkChip tone={state.tone} dot={state.dot}>
      {state.label}
    </KkChip>
  );

  const sinceRow =
    memberSince === null ? null : (
      <KkFieldRow
        label={toMemberSinceLabel(member.membershipState)}
        value={formatIsoDay(memberSince)}
      />
    );

  return (
    <KkPanelSection title={MEMBER_SECTION_TITLES.club}>
      <KkPanel>
        <KkFieldRow label={MEMBERSHIP_LABEL} value={stateChip} />
        {sinceRow}
      </KkPanel>
    </KkPanelSection>
  );
};
