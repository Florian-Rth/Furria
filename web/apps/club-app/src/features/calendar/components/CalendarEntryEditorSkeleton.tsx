import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion, CALENDAR_ORIGIN } from '@/features/session';

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
