import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { APPLICATIONS_HELP_COPY, APPLICATIONS_HELP_SPOTS } from '../applications-help-copy';
import { ApplicationsHelpRowPreview } from './ApplicationsHelpRowPreview';

export const ApplicationsHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{APPLICATIONS_HELP_COPY.what.title}</KkHelp.Title>
      <KkHelp.Text>{APPLICATIONS_HELP_COPY.what.text}</KkHelp.Text>
      <KkHelp.Text>{APPLICATIONS_HELP_COPY.what.notYet}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <ApplicationsHelpRowPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{APPLICATIONS_HELP_COPY.list.title}</KkHelp.Title>
      <KkHelp.Text>{APPLICATIONS_HELP_COPY.list.text}</KkHelp.Text>
      <KkHelp.Text>{APPLICATIONS_HELP_COPY.list.minor}</KkHelp.Text>
      <ScreenHelpShow spot={APPLICATIONS_HELP_SPOTS.list} />
    </KkHelp.Hint>
  </ScreenHelp>
);
