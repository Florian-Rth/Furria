import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { ANNOUNCEMENTS_ORIGIN } from '../announcements-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

interface AnnouncementEditorSkeletonProps {
  title: string;
}

export const AnnouncementEditorSkeleton: FC<AnnouncementEditorSkeletonProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={ANNOUNCEMENTS_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
