import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, PROFILE_ORIGIN } from '@/features/session/app-sections';
import { SECURITY_LEAD, SECURITY_TITLE } from '../account-security-labels';
import { AccountSecurityBody } from './AccountSecurityBody';

export const AccountSecurityScreen: FC = () => (
  <KkScreen
    kind="detail"
    title={SECURITY_TITLE}
    origin={PROFILE_ORIGIN}
    header={<KkTitleHeader title={SECURITY_TITLE} lead={SECURITY_LEAD} />}
    handover={AREA_HANDOVERS.profile}
  >
    <AccountSecurityBody />
  </KkScreen>
);
