import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { CALENDAR_ORIGIN } from '@/features/session/app-sections';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

interface CalendarEntryEditorSkeletonProps {
  title: string;
}

export const CalendarEntryEditorSkeleton: FC<CalendarEntryEditorSkeletonProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={CALENDAR_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
