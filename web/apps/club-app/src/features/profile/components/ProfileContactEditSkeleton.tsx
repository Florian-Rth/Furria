import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

const LOADING_LABEL = 'Deine Kontaktdaten werden geladen';
const SKELETON_LINES = 4;

export const ProfileContactEditSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelStack>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </KkPanel>
    </KkPanelStack>
  </AppSkeletonRegion>
);
