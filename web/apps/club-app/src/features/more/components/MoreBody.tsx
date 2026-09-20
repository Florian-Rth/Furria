import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import {
  AppSignOutButton,
  LATER_SECTIONS,
  MANAGE_SECTIONS,
  toPermittedSections,
  usePermissions,
} from '@/features/session';
import { MORE_PANEL_TITLES } from '../more-labels';
import { MoreProfilePanel } from './MoreProfilePanel';
import { MoreSectionPanel } from './MoreSectionPanel';

export const MoreBody: FC = () => {
  const { keys } = usePermissions();
  const manageSections = toPermittedSections(MANAGE_SECTIONS, keys);

  return (
    <KkPanelStack>
      <MoreProfilePanel />
      <MoreSectionPanel title={MORE_PANEL_TITLES.manage} sections={manageSections} />
      <MoreSectionPanel title={MORE_PANEL_TITLES.later} sections={LATER_SECTIONS} />
      <AppSignOutButton />
    </KkPanelStack>
  );
};
