import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { MAIL_INVITATION_HELP_COPY } from '../person-access-help-copy';

export const PersonMailInvitationHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{MAIL_INVITATION_HELP_COPY.mail.title}</KkHelp.Title>
      <KkHelp.Text>{MAIL_INVITATION_HELP_COPY.mail.text}</KkHelp.Text>
      <KkHelp.Text>{MAIL_INVITATION_HELP_COPY.mail.address}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{MAIL_INVITATION_HELP_COPY.single.title}</KkHelp.Title>
      <KkHelp.Text>{MAIL_INVITATION_HELP_COPY.single.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{MAIL_INVITATION_HELP_COPY.send.title}</KkHelp.Title>
      <KkHelp.Text>{MAIL_INVITATION_HELP_COPY.send.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
