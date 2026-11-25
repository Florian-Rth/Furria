import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import type { MePerson } from '@/lib/api/schemas';
import {
  CLUB_GROUP_CONSENT_DESCRIPTION,
  CLUB_GROUP_CONSENT_LABEL,
  CLUB_GROUP_CONSENT_TITLE,
} from '@/lib/club-group-consent-copy';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import { useClubGroupConsent } from '../hooks/use-club-group-consent';
import { PROFILE_HELP_SPOTS } from '../profile-help-copy';

interface ProfileClubGroupPanelProps {
  person: MePerson;
}

export const ProfileClubGroupPanel: FC<ProfileClubGroupPanelProps> = ({ person }) => {
  const consent = useClubGroupConsent(person.clubGroupConsent);

  return (
    <KkPanelSection title={CLUB_GROUP_CONSENT_TITLE} landing={PROFILE_HELP_SPOTS.clubGroup}>
      <KkPanel variant="block">
        <KkSwitchRow
          label={CLUB_GROUP_CONSENT_LABEL}
          description={CLUB_GROUP_CONSENT_DESCRIPTION}
          checked={consent.hasConsented}
          onChange={consent.toggle}
          stateLabel={SWITCH_STATE_LABELS}
          error={consent.error}
          busy={consent.isSaving}
        />
      </KkPanel>
    </KkPanelSection>
  );
};
