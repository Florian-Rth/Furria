import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { CLUB_EDITOR_HELP_SPOTS, CLUB_IDENTITY_HELP_COPY } from '../club-record-help-copy';

export const ClubIdentityHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_IDENTITY_HELP_COPY.fields.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_IDENTITY_HELP_COPY.fields.text}</KkHelp.Text>
      <KkHelp.Text>{CLUB_IDENTITY_HELP_COPY.fields.optional}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_EDITOR_HELP_SPOTS.identity} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_IDENTITY_HELP_COPY.save.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_IDENTITY_HELP_COPY.save.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
