import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import {
  type AnnouncementScreenKind,
  toAnnouncementScreenFrame,
} from '../announcement-screen-kind';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

interface AnnouncementScreenSkeletonProps {
  kind: AnnouncementScreenKind;
  title: string;
}

export const AnnouncementScreenSkeleton: FC<AnnouncementScreenSkeletonProps> = ({
  kind,
  title,
}) => {
  const frame = toAnnouncementScreenFrame(kind, title);

  return (
    <KkScreen {...frame}>
      <AppSkeletonRegion label={LOADING_LABEL}>
        <KkPanelStack>
          <KkPanel variant="block">
            <KkSkeletonBlock lines={SKELETON_LINES} />
          </KkPanel>
        </KkPanelStack>
      </AppSkeletonRegion>
    </KkScreen>
  );
};
