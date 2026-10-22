import { KkPanelStack } from '@furria/ui/KkPanelStack';
import type { FC } from 'react';
import {
  GALLERY_SECTION,
  MANAGE_SECTIONS,
  toPermittedSections,
} from '@/features/session/app-sections';
import { AppSignOutButton } from '@/features/session/components/AppSignOutButton';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { MORE_PANEL_TITLES } from '../more-labels';
import { MoreProfilePanel } from './MoreProfilePanel';
import { MoreSectionPanel } from './MoreSectionPanel';
import { MoreSectionSkeleton } from './MoreSectionSkeleton';

export const MoreBody: FC = () => {
  const { keys, isManagingLogin, isUndecided } = usePermissions();
  const manageSections = toPermittedSections(MANAGE_SECTIONS, keys);
  const gallerySections = toPermittedSections([GALLERY_SECTION], keys);

  const managePanel = isUndecided ? (
    <MoreSectionSkeleton title={MORE_PANEL_TITLES.manage} rowCount={MANAGE_SECTIONS.length} />
  ) : (
    <MoreSectionPanel title={MORE_PANEL_TITLES.manage} sections={manageSections} />
  );

  const profilePanel = isManagingLogin ? null : <MoreProfilePanel />;

  return (
    <KkPanelStack>
      {profilePanel}
      <MoreSectionPanel title={MORE_PANEL_TITLES.gallery} sections={gallerySections} />
      {managePanel}
      <AppSignOutButton />
    </KkPanelStack>
  );
};
