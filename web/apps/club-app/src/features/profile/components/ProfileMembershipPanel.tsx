import { KkFieldRow } from '@furria/ui';
import type { FC } from 'react';
import type { Membership } from '@/lib/api/schemas';
import {
  formatMembershipPeriod,
  toMembershipStatusLabel,
  toMembershipTypeLabel,
} from '@/lib/membership-labels';
import { ProfilePanel } from './ProfilePanel';

const NO_MEMBERSHIP = 'Keine Mitgliedschaft hinterlegt';

interface ProfileMembershipPanelProps {
  membership: Membership | null;
}

export const ProfileMembershipPanel: FC<ProfileMembershipPanelProps> = ({ membership }) => {
  if (membership === null) {
    return (
      <ProfilePanel title="Mitgliedschaft">
        <KkFieldRow label="Status" value={NO_MEMBERSHIP} />
      </ProfilePanel>
    );
  }

  return (
    <ProfilePanel title="Mitgliedschaft">
      <KkFieldRow label="Art" value={toMembershipTypeLabel(membership.type)} />
      <KkFieldRow label="Status" value={toMembershipStatusLabel(membership.status)} />
      <KkFieldRow
        label="Zeitraum"
        value={formatMembershipPeriod(membership.startedAt, membership.endedAt)}
      />
    </ProfilePanel>
  );
};
