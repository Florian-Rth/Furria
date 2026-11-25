import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { SECURITY_PATH, SECURITY_TITLE } from '@/features/account-security/account-security-labels';
import { PROFILE_HELP_SPOTS } from '../profile-help-copy';
import { PROFILE_SECTION_TITLES } from '../profile-labels';

interface ProfileSecurityPanelProps {
  loginEmail: string;
}

export const ProfileSecurityPanel: FC<ProfileSecurityPanelProps> = ({ loginEmail }) => (
  <KkPanelSection title={PROFILE_SECTION_TITLES.signIn} landing={PROFILE_HELP_SPOTS.signIn}>
    <KkPanel>
      <KkHubRow
        label={SECURITY_TITLE}
        icon="key"
        meta={loginEmail}
        component={Link}
        to={SECURITY_PATH}
      />
    </KkPanel>
  </KkPanelSection>
);
