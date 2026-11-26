import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { EVENT_MANAGE_HELP_COPY, EVENT_MANAGE_HELP_SPOTS } from '../event-manage-help-copy';

export const EventManageHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENT_MANAGE_HELP_COPY.picture.title}</KkHelp.Title>
      <KkHelp.Text>{EVENT_MANAGE_HELP_COPY.picture.text}</KkHelp.Text>
      <KkHelp.Text>{EVENT_MANAGE_HELP_COPY.picture.live}</KkHelp.Text>
      <ScreenHelpShow spot={EVENT_MANAGE_HELP_SPOTS.picture} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENT_MANAGE_HELP_COPY.cancel.title}</KkHelp.Title>
      <KkHelp.Text>{EVENT_MANAGE_HELP_COPY.cancel.text}</KkHelp.Text>
      <KkHelp.Text>{EVENT_MANAGE_HELP_COPY.cancel.restore}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENT_MANAGE_HELP_COPY.delete.title}</KkHelp.Title>
      <KkHelp.Text>{EVENT_MANAGE_HELP_COPY.delete.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
