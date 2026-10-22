import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { AppUserLink } from '@/features/session/components/AppUserLink';
import { MORE_PANEL_TITLES } from '../more-labels';

export const MoreProfilePanel: FC = () => (
  <KkPanelSection title={MORE_PANEL_TITLES.profile}>
    <KkPanel>
      <AppUserLink />
    </KkPanel>
  </KkPanelSection>
);
