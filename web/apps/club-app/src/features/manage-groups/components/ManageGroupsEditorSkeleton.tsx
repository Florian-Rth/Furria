import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { MANAGE_GROUPS_ORIGIN } from '../manage-groups-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

interface ManageGroupsEditorSkeletonProps {
  title: string;
}

export const ManageGroupsEditorSkeleton: FC<ManageGroupsEditorSkeletonProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={MANAGE_GROUPS_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
