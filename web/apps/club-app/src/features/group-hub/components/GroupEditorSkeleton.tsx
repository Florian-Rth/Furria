import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { GROUPS_ORIGIN } from '@/features/session/app-sections';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;
const FALLBACK_TITLE = 'Gruppe';

export const GroupEditorSkeleton: FC = () => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={GROUPS_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
