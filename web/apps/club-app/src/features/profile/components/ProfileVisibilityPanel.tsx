import { KkNote, KkPanel, KkPanelSection, KkSwitchRow } from '@furria/ui';
import type { FC } from 'react';
import type { MePerson } from '@/lib/api/schemas';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import { useContactVisibility } from '../hooks/use-contact-visibility';
import {
  PROFILE_SECTION_TITLES,
  VISIBILITY_EXPLANATION,
  VISIBILITY_KEY_HOLDER_NOTE,
  VISIBILITY_OFF_NOTE,
  VISIBILITY_SWITCH_LABEL,
} from '../profile-labels';

interface ProfileVisibilityPanelProps {
  person: MePerson;
}

export const ProfileVisibilityPanel: FC<ProfileVisibilityPanelProps> = ({ person }) => {
  const visibility = useContactVisibility(person.contactVisibleToMembers);

  const offNote = visibility.isVisible ? null : (
    <KkPanel variant="block" sx={{ py: 1.375 }}>
      <KkNote>{VISIBILITY_OFF_NOTE}</KkNote>
    </KkPanel>
  );

  return (
    <KkPanelSection title={PROFILE_SECTION_TITLES.visibility}>
      <KkPanel variant="block" sx={{ gap: 1.75 }}>
        <KkSwitchRow
          label={VISIBILITY_SWITCH_LABEL}
          checked={visibility.isVisible}
          onChange={visibility.toggle}
          description={VISIBILITY_EXPLANATION}
          stateLabel={SWITCH_STATE_LABELS}
          error={visibility.error}
          busy={visibility.isSaving}
        />
        <KkNote tone="info" icon="permissions">
          {VISIBILITY_KEY_HOLDER_NOTE}
        </KkNote>
        {offNote}
      </KkPanel>
    </KkPanelSection>
  );
};
