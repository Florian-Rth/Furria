import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { SECURITY_HELP_COPY, SECURITY_HELP_SPOTS } from '../security-help-copy';

export const PasswordHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{SECURITY_HELP_COPY.newPassword.title}</KkHelp.Title>
      <KkHelp.Text>{SECURITY_HELP_COPY.newPassword.text}</KkHelp.Text>
      <KkHelp.Text>{SECURITY_HELP_COPY.newPassword.after}</KkHelp.Text>
      <ScreenHelpShow spot={SECURITY_HELP_SPOTS.newPassword} />
    </KkHelp.Hint>
  </ScreenHelp>
);
