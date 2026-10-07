import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import {
  AppSignOutButton,
  MANAGE_SECTIONS,
  toPermittedSections,
  usePermissions,
} from '@/features/session';
import { MORE_PANEL_TITLES } from '../more-labels';
import { MoreProfilePanel } from './MoreProfilePanel';
import { MoreSectionPanel } from './MoreSectionPanel';
import { MoreSectionSkeleton } from './MoreSectionSkeleton';

export const MoreBody: FC = () => {
  const { keys, isManagingLogin, isUndecided } = usePermissions();
  const manageSections = toPermittedSections(MANAGE_SECTIONS, keys);

  const managePanel = isUndecided ? (
    <MoreSectionSkeleton title={MORE_PANEL_TITLES.manage} rowCount={MANAGE_SECTIONS.length} />
  ) : (
    <MoreSectionPanel title={MORE_PANEL_TITLES.manage} sections={manageSections} />
  );

  const profilePanel = isManagingLogin ? null : <MoreProfilePanel />;

  return (
    <KkPanelStack>
      {profilePanel}
      {managePanel}
      <AppSignOutButton />
    </KkPanelStack>
  );
};
