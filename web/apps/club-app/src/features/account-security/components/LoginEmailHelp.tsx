import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { SECURITY_HELP_COPY, SECURITY_HELP_SPOTS } from '../security-help-copy';

export const LoginEmailHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{SECURITY_HELP_COPY.newAddress.title}</KkHelp.Title>
      <KkHelp.Text>{SECURITY_HELP_COPY.newAddress.text}</KkHelp.Text>
      <KkHelp.Text>{SECURITY_HELP_COPY.newAddress.contact}</KkHelp.Text>
      <ScreenHelpShow spot={SECURITY_HELP_SPOTS.newAddress} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{SECURITY_HELP_COPY.code.title}</KkHelp.Title>
      <KkHelp.Text>{SECURITY_HELP_COPY.code.text}</KkHelp.Text>
      <KkHelp.Text>{SECURITY_HELP_COPY.code.resend}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
