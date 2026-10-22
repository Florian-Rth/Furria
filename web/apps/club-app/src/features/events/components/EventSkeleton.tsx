import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

const PICTURE_LINES = 5;
const ACTION_LINES = 2;
const LOADING_LABEL = 'Die Veranstaltung wird geladen';

export const EventSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL}>
    <KkPanelStack>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={PICTURE_LINES} />
      </KkPanel>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={ACTION_LINES} />
      </KkPanel>
    </KkPanelStack>
  </AppSkeletonRegion>
);
