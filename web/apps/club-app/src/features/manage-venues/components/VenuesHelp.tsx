import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { VENUES_HELP_COPY, VENUES_HELP_SPOTS } from '../venues-help-copy';
import { VenuesHelpRecordPreview } from './VenuesHelpRecordPreview';

export const VenuesHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <VenuesHelpRecordPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{VENUES_HELP_COPY.list.title}</KkHelp.Title>
      <KkHelp.Text>{VENUES_HELP_COPY.list.text}</KkHelp.Text>
      <KkHelp.Text>{VENUES_HELP_COPY.list.open}</KkHelp.Text>
      <ScreenHelpShow spot={VENUES_HELP_SPOTS.list} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{VENUES_HELP_COPY.usage.title}</KkHelp.Title>
      <KkHelp.Text>{VENUES_HELP_COPY.usage.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{VENUES_HELP_COPY.archived.title}</KkHelp.Title>
      <KkHelp.Text>{VENUES_HELP_COPY.archived.text}</KkHelp.Text>
      <KkHelp.Text>{VENUES_HELP_COPY.archived.restore}</KkHelp.Text>
      <ScreenHelpShow spot={VENUES_HELP_SPOTS.archived} />
    </KkHelp.Hint>
  </ScreenHelp>
);
