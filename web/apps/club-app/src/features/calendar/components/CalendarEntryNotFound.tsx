import { KkEmptyState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { CALENDAR_ORIGIN, CALENDAR_TITLE } from '../calendar-labels';

const NOT_FOUND_TITLE = 'NICHT MEHR DA';
const NOT_FOUND_DESCRIPTION = 'Diesen Termin gibt es nicht mehr.';

export const CalendarEntryNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={CALENDAR_TITLE} origin={CALENDAR_ORIGIN}>
    <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />
  </KkScreen>
);
