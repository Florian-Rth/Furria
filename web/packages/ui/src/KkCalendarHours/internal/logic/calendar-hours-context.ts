import { createContext, useContext } from 'react';
import type { KkCalendarHoursAxis } from './calendar-hours-types';
import type { KkCalendarHoursMeter } from './use-hours-label-meter';

export interface CalendarHoursState {
  axis: KkCalendarHoursAxis;
  trackWidth: number;
  measureTrack: (node: HTMLElement | null) => (() => void) | undefined;
  meter: KkCalendarHoursMeter;
  reduced: boolean;
}

export const CalendarHoursContext = createContext<CalendarHoursState | null>(null);

export const useCalendarHours = (): CalendarHoursState => {
  const state = useContext(CalendarHoursContext);

  if (state === null) {
    throw new Error('A lane week part was rendered outside KkCalendarHours.');
  }

  return state;
};
