import { KkPanel, KkPanelStack, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';

const LOADING_LABEL = 'Die Vereinsdaten werden geladen';
const SKELETON_LINES = 3;

export const ClubSectionSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelStack>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </KkPanel>
    </KkPanelStack>
  </AppSkeletonRegion>
);
