import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { KEYS_ORIGIN, MANAGE_KEYS_TITLE } from '../manage-keys-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

export const KeyEditorSkeleton: FC = () => (
  <KkScreen kind="fullscreen" title={MANAGE_KEYS_TITLE} origin={KEYS_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
