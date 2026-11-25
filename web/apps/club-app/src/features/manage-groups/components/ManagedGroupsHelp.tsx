import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { GROUPS_HELP_COPY, GROUPS_HELP_SPOTS } from '../manage-groups-help-copy';
import { GroupsHelpFlagsPreview } from './GroupsHelpFlagsPreview';

export const ManagedGroupsHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <GroupsHelpFlagsPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{GROUPS_HELP_COPY.register.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.register.text}</KkHelp.Text>
      <KkHelp.Text>{GROUPS_HELP_COPY.register.flags}</KkHelp.Text>
      <ScreenHelpShow spot={GROUPS_HELP_SPOTS.register} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUPS_HELP_COPY.filters.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.filters.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUPS_HELP_COPY.add.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.add.text}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUPS_HELP_COPY.archive.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.archive.text}</KkHelp.Text>
      <KkHelp.Text>{GROUPS_HELP_COPY.archive.restore}</KkHelp.Text>
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{GROUPS_HELP_COPY.kinds.title}</KkHelp.Title>
      <KkHelp.Text>{GROUPS_HELP_COPY.kinds.text}</KkHelp.Text>
      <KkHelp.Text>{GROUPS_HELP_COPY.kinds.add}</KkHelp.Text>
      <ScreenHelpShow spot={GROUPS_HELP_SPOTS.kinds} />
    </KkHelp.Hint>
  </ScreenHelp>
);
