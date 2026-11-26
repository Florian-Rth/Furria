import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { EVENT_HELP_COPY, EVENT_HELP_SPOTS } from '../event-help-copy';
import { EventHelpStepsPreview } from './EventHelpStepsPreview';

export const EventHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENT_HELP_COPY.overview.title}</KkHelp.Title>
      <KkHelp.Text>{EVENT_HELP_COPY.overview.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <EventHelpStepsPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{EVENT_HELP_COPY.steps.title}</KkHelp.Title>
      <KkHelp.Text>{EVENT_HELP_COPY.steps.text}</KkHelp.Text>
      <KkHelp.Text>{EVENT_HELP_COPY.steps.computed}</KkHelp.Text>
      <ScreenHelpShow spot={EVENT_HELP_SPOTS.steps} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENT_HELP_COPY.publish.title}</KkHelp.Title>
      <KkHelp.Text>{EVENT_HELP_COPY.publish.text}</KkHelp.Text>
      <KkHelp.Text>{EVENT_HELP_COPY.publish.effect}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENT_HELP_COPY.evening.title}</KkHelp.Title>
      <KkHelp.Text>{EVENT_HELP_COPY.evening.text}</KkHelp.Text>
      <KkHelp.Text>{EVENT_HELP_COPY.evening.noTables}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENT_HELP_COPY.change.title}</KkHelp.Title>
      <KkHelp.Text>{EVENT_HELP_COPY.change.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
