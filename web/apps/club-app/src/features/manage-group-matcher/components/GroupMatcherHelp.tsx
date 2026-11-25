import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { GROUP_MATCHER_HELP_COPY, GROUP_MATCHER_HELP_SPOTS } from '../group-matcher-help-copy';
import { GroupMatcherHelpLegendPreview } from './GroupMatcherHelpLegendPreview';

export const GroupMatcherHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUP_MATCHER_HELP_COPY.pool.title}</KkHelp.Title>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.pool.text}</KkHelp.Text>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.pool.add}</KkHelp.Text>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.pool.order}</KkHelp.Text>
      <ScreenHelpShow spot={GROUP_MATCHER_HELP_SPOTS.pool} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUP_MATCHER_HELP_COPY.statement.title}</KkHelp.Title>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.statement.text}</KkHelp.Text>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.statement.delete}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <GroupMatcherHelpLegendPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{GROUP_MATCHER_HELP_COPY.coverage.title}</KkHelp.Title>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.coverage.text}</KkHelp.Text>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.coverage.part}</KkHelp.Text>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.coverage.website}</KkHelp.Text>
      <ScreenHelpShow spot={GROUP_MATCHER_HELP_SPOTS.coverage} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUP_MATCHER_HELP_COPY.stances.title}</KkHelp.Title>
      <KkHelp.Text>{GROUP_MATCHER_HELP_COPY.stances.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
