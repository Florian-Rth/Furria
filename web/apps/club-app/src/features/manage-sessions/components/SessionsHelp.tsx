import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { SESSIONS_HELP_COPY, SESSIONS_HELP_SPOTS } from '../sessions-help-copy';
import { SessionsHelpRowsPreview } from './SessionsHelpRowsPreview';

export const SessionsHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{SESSIONS_HELP_COPY.record.title}</KkHelp.Title>
      <KkHelp.Text>{SESSIONS_HELP_COPY.record.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <SessionsHelpRowsPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{SESSIONS_HELP_COPY.current.title}</KkHelp.Title>
      <KkHelp.Text>{SESSIONS_HELP_COPY.current.text}</KkHelp.Text>
      <KkHelp.Text>{SESSIONS_HELP_COPY.current.vacant}</KkHelp.Text>
      <KkHelp.Text>{SESSIONS_HELP_COPY.current.add}</KkHelp.Text>
      <ScreenHelpShow spot={SESSIONS_HELP_SPOTS.current} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{SESSIONS_HELP_COPY.past.title}</KkHelp.Title>
      <KkHelp.Text>{SESSIONS_HELP_COPY.past.text}</KkHelp.Text>
      <ScreenHelpShow spot={SESSIONS_HELP_SPOTS.past} />
    </KkHelp.Hint>
  </ScreenHelp>
);
