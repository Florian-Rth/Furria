import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { CALENDAR_ORIGIN, CALENDAR_TITLE } from '../calendar-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

export const CalendarEntryEditorSkeleton: FC = () => (
  <KkScreen kind="fullscreen" title={CALENDAR_TITLE} origin={CALENDAR_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
