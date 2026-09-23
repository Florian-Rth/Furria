import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { SESSIONS_ORIGIN } from '../manage-sessions-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

interface SessionEditorSkeletonProps {
  title: string;
}

export const SessionEditorSkeleton: FC<SessionEditorSkeletonProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={SESSIONS_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
