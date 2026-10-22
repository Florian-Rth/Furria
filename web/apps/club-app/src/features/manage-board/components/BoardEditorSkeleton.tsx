import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { BOARD_ORIGIN } from '../manage-board-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;
const FALLBACK_TITLE = 'Vorstand';

export const BoardEditorSkeleton: FC = () => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={BOARD_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
