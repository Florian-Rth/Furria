import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { EVENTS_ORIGIN } from '@/features/session/app-sections';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

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
