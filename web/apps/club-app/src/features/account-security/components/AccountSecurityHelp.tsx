import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { SecurityHelpViewer } from '../hooks/use-security-help-viewer';
import { SECURITY_HELP_COPY, SECURITY_HELP_SPOTS } from '../security-help-copy';

interface AccountSecurityHelpProps {
  viewer: SecurityHelpViewer;
}

export const AccountSecurityHelp: FC<AccountSecurityHelpProps> = ({ viewer }) => {
  const passkeyAdding = viewer.addsPasskeys
    ? SECURITY_HELP_COPY.passkeys.add
    : SECURITY_HELP_COPY.passkeys.unavailable;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{SECURITY_HELP_COPY.loginEmail.title}</KkHelp.Title>
        <KkHelp.Text>{SECURITY_HELP_COPY.loginEmail.text}</KkHelp.Text>
        <ScreenHelpShow spot={SECURITY_HELP_SPOTS.loginEmail} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{SECURITY_HELP_COPY.password.title}</KkHelp.Title>
        <KkHelp.Text>{SECURITY_HELP_COPY.password.text}</KkHelp.Text>
        <ScreenHelpShow spot={SECURITY_HELP_SPOTS.password} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{SECURITY_HELP_COPY.passkeys.title}</KkHelp.Title>
        <KkHelp.Text>{SECURITY_HELP_COPY.passkeys.text}</KkHelp.Text>
        <KkHelp.Text>{passkeyAdding}</KkHelp.Text>
        <KkHelp.Text>{SECURITY_HELP_COPY.passkeys.open}</KkHelp.Text>
        <ScreenHelpShow spot={SECURITY_HELP_SPOTS.passkeys} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{SECURITY_HELP_COPY.devices.title}</KkHelp.Title>
        <KkHelp.Text>{SECURITY_HELP_COPY.devices.text}</KkHelp.Text>
        <ScreenHelpShow spot={SECURITY_HELP_SPOTS.devices} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{SECURITY_HELP_COPY.deletion.title}</KkHelp.Title>
        <KkHelp.Text>{SECURITY_HELP_COPY.deletion.text}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
