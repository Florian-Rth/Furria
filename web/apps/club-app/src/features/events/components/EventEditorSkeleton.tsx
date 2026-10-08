import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion, EVENTS_ORIGIN } from '@/features/session';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 8;

interface EventEditorSkeletonProps {
  title: string;
}

export const EventEditorSkeleton: FC<EventEditorSkeletonProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={EVENTS_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
