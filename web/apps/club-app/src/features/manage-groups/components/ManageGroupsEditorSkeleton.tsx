import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MANAGE_GROUPS_ORIGIN } from '../manage-groups-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;
const TITLE_FALLBACK = 'Gruppenart';

export const ManageGroupsEditorSkeleton: FC = () => (
  <KkScreen kind="fullscreen" title={TITLE_FALLBACK} origin={MANAGE_GROUPS_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
