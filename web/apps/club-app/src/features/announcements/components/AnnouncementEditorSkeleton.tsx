import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
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
