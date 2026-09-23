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
import { MoreSectionSkeleton } from './MoreSectionSkeleton';

export const MoreBody: FC = () => {
  const { keys, isUndecided } = usePermissions();
  const manageSections = toPermittedSections(MANAGE_SECTIONS, keys);

  const managePanel = isUndecided ? (
    <MoreSectionSkeleton title={MORE_PANEL_TITLES.manage} rowCount={MANAGE_SECTIONS.length} />
  ) : (
    <MoreSectionPanel title={MORE_PANEL_TITLES.manage} sections={manageSections} />
  );

  return (
    <KkPanelStack>
      <MoreProfilePanel />
      {managePanel}
      <MoreSectionPanel title={MORE_PANEL_TITLES.later} sections={LATER_SECTIONS} />
      <AppSignOutButton />
    </KkPanelStack>
  );
};
