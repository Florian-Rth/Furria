import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { VENUES_ORIGIN } from '../manage-venues-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

export const VenueEditorSkeleton: FC = () => (
  <KkScreen kind="fullscreen" title={VENUES_ORIGIN.label} origin={VENUES_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
