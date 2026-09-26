import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import { AccountDeletionPanel } from './AccountDeletionPanel';
import { LoginEmailPanel } from './LoginEmailPanel';
import { LogoutEverywherePanel } from './LogoutEverywherePanel';
import { PasswordPanel } from './PasswordPanel';

interface AccountSecurityPanelsProps {
  loginEmail: string;
}

export const AccountSecurityPanels: FC<AccountSecurityPanelsProps> = ({ loginEmail }) => {
  const { highlightedKey } = useLanding();

  return (
    <KkPanelStack>
      <LoginEmailPanel loginEmail={loginEmail} highlightedKey={highlightedKey} />
      <PasswordPanel highlightedKey={highlightedKey} />
      <LogoutEverywherePanel />
      <AccountDeletionPanel />
    </KkPanelStack>
  );
};
