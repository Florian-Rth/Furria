import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { PROFILE_ORIGIN } from '@/features/session';
import { SECURITY_TITLE } from '../account-security-labels';
import { AccountSecurityBody } from './AccountSecurityBody';

export const AccountSecurityScreen: FC = () => (
  <KkScreen kind="detail" title={SECURITY_TITLE} origin={PROFILE_ORIGIN}>
    <AccountSecurityBody />
  </KkScreen>
);
