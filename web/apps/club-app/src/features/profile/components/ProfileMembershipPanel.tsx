import { KkFieldRow } from '@furria/ui';
import type { FC } from 'react';
import type { MeMembership } from '@/lib/api/schemas';
import { formatIsoDay, formatPeriod, toMembershipStateLabel } from '@/lib/membership-labels';
import { PROFILE_SECTION_TITLES } from '../profile-labels';
import { ProfilePanel } from './ProfilePanel';

interface ProfileMembershipPanelProps {
  membership: MeMembership;
}

export const ProfileMembershipPanel: FC<ProfileMembershipPanelProps> = ({ membership }) => {
  const { memberSince, currentStartedOn, currentEndedOn } = membership;

  const memberSinceRow =
    memberSince === null ? null : (
      <KkFieldRow label="Mitglied seit" value={formatIsoDay(memberSince)} />
    );

  const periodRow =
    currentStartedOn === null ? null : (
      <KkFieldRow label="Zeitraum" value={formatPeriod(currentStartedOn, currentEndedOn)} />
    );

  return (
    <ProfilePanel title={PROFILE_SECTION_TITLES.membership}>
      <KkFieldRow label="Status" value={toMembershipStateLabel(membership.state)} />
      {memberSinceRow}
      {periodRow}
    </ProfilePanel>
  );
};
