import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { GROUPS_HELP_COPY, GROUPS_HELP_SPOTS } from '../manage-groups-help-copy';

export const GroupKindHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUPS_HELP_COPY.kind.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.kinds.text}</KkHelp.Text>
      <KkHelp.Text>{GROUPS_HELP_COPY.kind.text}</KkHelp.Text>
      <ScreenHelpShow spot={GROUPS_HELP_SPOTS.kind} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUPS_HELP_COPY.kindArchive.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.kindArchive.text}</KkHelp.Text>
      <KkHelp.Text>{GROUPS_HELP_COPY.kindArchive.restore}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
