import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { CLUB_LOADING_LABEL } from '../club-labels';

const PLACEHOLDER_PANELS = ['first', 'second', 'third'];
const PLACEHOLDER_LINES = 3;

export const ClubSkeleton: FC = () => (
  <AppSkeletonRegion label={CLUB_LOADING_LABEL}>
    <KkPanelStack>
      {PLACEHOLDER_PANELS.map((panel) => (
        <KkPanel key={panel} variant="block">
          <KkSkeletonBlock lines={PLACEHOLDER_LINES} />
        </KkPanel>
      ))}
    </KkPanelStack>
  </AppSkeletonRegion>
);
