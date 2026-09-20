import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import {
  CALENDAR_DAY_EMPTY_LINE,
  CALENDAR_DAY_EMPTY_TITLE,
  CALENDAR_EMPTY_LINE,
  CALENDAR_EMPTY_TITLE,
} from '../calendar-labels';

interface CalendarEmptyProps {
  dayFiltered: boolean;
}

export const CalendarEmpty: FC<CalendarEmptyProps> = ({ dayFiltered }) => {
  const title = dayFiltered ? CALENDAR_DAY_EMPTY_TITLE : CALENDAR_EMPTY_TITLE;
  const description = dayFiltered ? CALENDAR_DAY_EMPTY_LINE : CALENDAR_EMPTY_LINE;

  return <KkEmptyState title={title} description={description} />;
};
