import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { SECURITY_HELP_COPY, SECURITY_HELP_SPOTS } from '../security-help-copy';

export const PasskeyHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{SECURITY_HELP_COPY.passkey.title}</KkHelp.Title>
      <KkHelp.Text>{SECURITY_HELP_COPY.passkey.text}</KkHelp.Text>
      <ScreenHelpShow spot={SECURITY_HELP_SPOTS.passkey} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{SECURITY_HELP_COPY.passkeyRemoval.title}</KkHelp.Title>
      <KkHelp.Text>{SECURITY_HELP_COPY.passkeyRemoval.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
