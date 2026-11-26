import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { APPLICATION_HELP_COPY, APPLICATION_HELP_SPOTS } from '../applications-help-copy';

export const ApplicationHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{APPLICATION_HELP_COPY.details.title}</KkHelp.Title>
      <KkHelp.Text>{APPLICATION_HELP_COPY.details.text}</KkHelp.Text>
      <ScreenHelpShow spot={APPLICATION_HELP_SPOTS.applicant} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{APPLICATION_HELP_COPY.admit.title}</KkHelp.Title>
      <KkHelp.Text>{APPLICATION_HELP_COPY.admit.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{APPLICATION_HELP_COPY.decline.title}</KkHelp.Title>
      <KkHelp.Text>{APPLICATION_HELP_COPY.decline.text}</KkHelp.Text>
      <KkHelp.Text>{APPLICATION_HELP_COPY.decline.spam}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
