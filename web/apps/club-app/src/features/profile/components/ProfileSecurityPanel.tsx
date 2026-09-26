import { KkHubRow, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { SECURITY_PATH, SECURITY_TITLE } from '@/features/account-security';
import { PROFILE_SECTION_TITLES } from '../profile-labels';

interface ProfileSecurityPanelProps {
  loginEmail: string;
}

export const ProfileSecurityPanel: FC<ProfileSecurityPanelProps> = ({ loginEmail }) => (
  <KkPanelSection title={PROFILE_SECTION_TITLES.signIn}>
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
