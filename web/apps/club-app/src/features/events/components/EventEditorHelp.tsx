import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { EVENT_EDITOR_HELP_COPY, EVENT_EDITOR_HELP_SPOTS } from '../event-editor-help-copy';
import type { EventEditorHelpViewer } from '../hooks/use-event-editor-help-viewer';
import { EventEditorHelpTimesPreview } from './EventEditorHelpTimesPreview';

interface EventEditorHelpProps {
  viewer: EventEditorHelpViewer;
}

export const EventEditorHelp: FC<EventEditorHelpProps> = ({ viewer }) => {
  const pictureLive = viewer.isEditing ? (
    <KkHelp.Text>{EVENT_EDITOR_HELP_COPY.picture.live}</KkHelp.Text>
  ) : null;
  const newPlace = viewer.addsPlaces ? (
    <KkHelp.Text>{EVENT_EDITOR_HELP_COPY.tickets.newPlace}</KkHelp.Text>
  ) : null;
  const saving = viewer.isEditing
    ? EVENT_EDITOR_HELP_COPY.save.edit
    : EVENT_EDITOR_HELP_COPY.save.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{EVENT_EDITOR_HELP_COPY.picture.title}</KkHelp.Title>
        <KkHelp.Text>{EVENT_EDITOR_HELP_COPY.picture.text}</KkHelp.Text>
        {pictureLive}
        <ScreenHelpShow spot={EVENT_EDITOR_HELP_SPOTS.picture} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <EventEditorHelpTimesPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{EVENT_EDITOR_HELP_COPY.schedule.title}</KkHelp.Title>
        <KkHelp.Text>{EVENT_EDITOR_HELP_COPY.schedule.text}</KkHelp.Text>
        <ScreenHelpShow spot={EVENT_EDITOR_HELP_SPOTS.schedule} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{EVENT_EDITOR_HELP_COPY.texts.title}</KkHelp.Title>
        <KkHelp.Text>{EVENT_EDITOR_HELP_COPY.texts.text}</KkHelp.Text>
        <ScreenHelpShow spot={EVENT_EDITOR_HELP_SPOTS.texts} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{EVENT_EDITOR_HELP_COPY.tickets.title}</KkHelp.Title>
        <KkHelp.Text>{EVENT_EDITOR_HELP_COPY.tickets.text}</KkHelp.Text>
        {newPlace}
        <ScreenHelpShow spot={EVENT_EDITOR_HELP_SPOTS.tickets} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{EVENT_EDITOR_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
        <KkHelp.Text>{EVENT_EDITOR_HELP_COPY.save.publish}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
