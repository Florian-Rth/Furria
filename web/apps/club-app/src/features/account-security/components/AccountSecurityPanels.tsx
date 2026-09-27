import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import type { MePasskey } from '@/lib/api/schemas';
import { AccountDeletionPanel } from './AccountDeletionPanel';
import { LoginEmailPanel } from './LoginEmailPanel';
import { LogoutEverywherePanel } from './LogoutEverywherePanel';
import { PasskeysPanel } from './PasskeysPanel';
import { PasswordPanel } from './PasswordPanel';

interface AccountSecurityPanelsProps {
  loginEmail: string;
  passkeys: readonly MePasskey[];
}

export const AccountSecurityPanels: FC<AccountSecurityPanelsProps> = ({ loginEmail, passkeys }) => {
  const { highlightedKey } = useLanding();
  const hasPasskeys = passkeys.length > 0;

  return (
    <KkPanelStack>
      <LoginEmailPanel loginEmail={loginEmail} highlightedKey={highlightedKey} />
      <PasswordPanel highlightedKey={highlightedKey} />
      <PasskeysPanel passkeys={passkeys} highlightedKey={highlightedKey} />
      <LogoutEverywherePanel />
      <AccountDeletionPanel hasPasskeys={hasPasskeys} />
    </KkPanelStack>
  );
};
