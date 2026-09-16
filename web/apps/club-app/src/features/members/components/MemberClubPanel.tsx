import { KkChip, KkFieldRow, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { formatIsoDay, toMemberSinceLabel } from '@/lib/membership-labels';
import { toMembershipStateChip } from '@/lib/state-chips';
import { MEMBER_SECTION_TITLES, toMembershipNote } from '../members-labels';
import type { MemberDetails } from '../schemas';

const MEMBERSHIP_LABEL = 'Mitgliedschaft';

interface MemberClubPanelProps {
  member: MemberDetails;
}

export const MemberClubPanel: FC<MemberClubPanelProps> = ({ member }) => {
  const state = toMembershipStateChip(member.membershipState);
  const note = toMembershipNote(member.membershipState, member.firstName);
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

  const noteLine = note === null ? null : <KkNote sx={{ py: 1.75 }}>{note}</KkNote>;

  return (
    <KkPanelSection title={MEMBER_SECTION_TITLES.club}>
      <KkPanel>
        <KkFieldRow label={MEMBERSHIP_LABEL} value={stateChip} />
        {sinceRow}
        {noteLine}
      </KkPanel>
    </KkPanelSection>
  );
};
