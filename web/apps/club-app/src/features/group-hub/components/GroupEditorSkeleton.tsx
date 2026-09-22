import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion, GROUPS_ORIGIN } from '@/features/session';

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
