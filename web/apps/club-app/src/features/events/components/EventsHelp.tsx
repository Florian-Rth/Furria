import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { EVENTS_HELP_COPY, EVENTS_HELP_SPOTS } from '../events-help-copy';
import { EventsHelpCellsPreview } from './EventsHelpCellsPreview';
import { EventsHelpStatesPreview } from './EventsHelpStatesPreview';

export const EventsHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENTS_HELP_COPY.health.title}</KkHelp.Title>
      <KkHelp.Text>{EVENTS_HELP_COPY.health.text}</KkHelp.Text>
      <KkHelp.Text>{EVENTS_HELP_COPY.health.filters}</KkHelp.Text>
      <ScreenHelpShow spot={EVENTS_HELP_SPOTS.health} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <EventsHelpCellsPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{EVENTS_HELP_COPY.evenings.title}</KkHelp.Title>
      <KkHelp.Text>{EVENTS_HELP_COPY.evenings.text}</KkHelp.Text>
      <KkHelp.Text>{EVENTS_HELP_COPY.evenings.open}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <EventsHelpStatesPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{EVENTS_HELP_COPY.states.title}</KkHelp.Title>
      <KkHelp.Text>{EVENTS_HELP_COPY.states.text}</KkHelp.Text>
      <KkHelp.Text>{EVENTS_HELP_COPY.states.computed}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{EVENTS_HELP_COPY.create.title}</KkHelp.Title>
      <KkHelp.Text>{EVENTS_HELP_COPY.create.text}</KkHelp.Text>
      <KkHelp.Text>{EVENTS_HELP_COPY.create.acts}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
