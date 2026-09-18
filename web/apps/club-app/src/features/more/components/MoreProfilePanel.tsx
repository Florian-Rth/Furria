import { KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { AppUserLink } from '@/features/session';
import { MORE_PANEL_TITLES } from '../more-labels';

export const MoreProfilePanel: FC = () => (
  <KkPanelSection title={MORE_PANEL_TITLES.profile}>
    <KkPanel>
      <AppUserLink />
    </KkPanel>
  </KkPanelSection>
);
