import { KkChip, KkFieldRow, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { MeMembership } from '@/lib/api/schemas';
import { formatIsoDay, formatPeriod } from '@/lib/membership-labels';
import { toMembershipStateChip } from '@/lib/state-chips';
import { PROFILE_SECTION_TITLES } from '../profile-labels';

const STATE_LABEL = 'Mitgliedschaft';

interface ProfileMembershipPanelProps {
  membership: MeMembership;
}

export const ProfileMembershipPanel: FC<ProfileMembershipPanelProps> = ({ membership }) => {
  const { memberSince, currentStartedOn, currentEndedOn } = membership;
  const periodRestatesChain = currentStartedOn === memberSince && currentEndedOn === null;
  const stateChip = toMembershipStateChip(membership.state);

  const memberSinceRow =
    memberSince === null ? null : (
      <KkFieldRow label="Mitglied seit" value={formatIsoDay(memberSince)} />
    );

  const periodRow =
    currentStartedOn === null || periodRestatesChain ? null : (
      <KkFieldRow label="Zeitraum" value={formatPeriod(currentStartedOn, currentEndedOn)} />
    );

  return (
    <KkPanelSection title={PROFILE_SECTION_TITLES.membership}>
      <KkPanel>
        <KkFieldRow
          label={STATE_LABEL}
          value={
            <KkChip tone={stateChip.tone} dot={stateChip.dot}>
              {stateChip.label}
            </KkChip>
          }
        />
        {memberSinceRow}
        {periodRow}
      </KkPanel>
    </KkPanelSection>
  );
};
