import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { CLUB_RECORD_HELP_COPY, CLUB_RECORD_HELP_SPOTS } from '../club-record-help-copy';

export const ClubRecordHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_RECORD_HELP_COPY.identity.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_RECORD_HELP_COPY.identity.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_RECORD_HELP_SPOTS.identity} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_RECORD_HELP_COPY.contact.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_RECORD_HELP_COPY.contact.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_RECORD_HELP_SPOTS.contact} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_RECORD_HELP_COPY.access.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_RECORD_HELP_COPY.access.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_RECORD_HELP_SPOTS.access} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_RECORD_HELP_COPY.stage.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_RECORD_HELP_COPY.stage.text}</KkHelp.Text>
      <ScreenHelpShow spot={CLUB_RECORD_HELP_SPOTS.stage} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{CLUB_RECORD_HELP_COPY.editing.title}</KkHelp.Title>
      <KkHelp.Text>{CLUB_RECORD_HELP_COPY.editing.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
