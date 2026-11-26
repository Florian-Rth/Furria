import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { CLUB_CONTACT_HELP_COPY, CLUB_EDITOR_HELP_SPOTS } from '../club-record-help-copy';

export const ClubContactHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_CONTACT_HELP_COPY.address.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_CONTACT_HELP_COPY.address.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_EDITOR_HELP_SPOTS.address} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_CONTACT_HELP_COPY.reach.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_CONTACT_HELP_COPY.reach.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_EDITOR_HELP_SPOTS.reach} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_CONTACT_HELP_COPY.web.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_CONTACT_HELP_COPY.web.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_EDITOR_HELP_SPOTS.web} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_CONTACT_HELP_COPY.save.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_CONTACT_HELP_COPY.save.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
