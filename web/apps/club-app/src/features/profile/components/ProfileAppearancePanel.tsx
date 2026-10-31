import { KkColorSchemeSwitch } from '@furria/ui/KkColorSchemeSwitch';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { APPEARANCE_CHOICES, APPEARANCE_LABEL, PROFILE_SECTION_TITLES } from '../profile-labels';

export const ProfileAppearancePanel: FC = () => (
  <KkPanelSection title={PROFILE_SECTION_TITLES.appearance}>
    <KkPanel variant="block">
      <KkColorSchemeSwitch label={APPEARANCE_LABEL} choices={APPEARANCE_CHOICES} />
    </KkPanel>
  </KkPanelSection>
);
