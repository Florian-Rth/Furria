import { useKkSheet } from '@furria/ui/sheet-store';
import { useState } from 'react';
import { START_CALENDAR_SHEET } from '../start-sheets';

export interface DayFocus {
  focusedDay: string | null;
  show: (isoDay: string) => void;
}

interface HeldFocus {
  day: string | null;
  open: boolean;
}

const UNFOCUSED: HeldFocus = { day: null, open: false };

export const useDayFocus = (): DayFocus => {
  const { openSheetId, open } = useKkSheet();
  const calendarOpen = openSheetId === START_CALENDAR_SHEET;
  const [held, setHeld] = useState<HeldFocus>(UNFOCUSED);

  if (held.open !== calendarOpen) {
    setHeld({ day: calendarOpen ? held.day : null, open: calendarOpen });
  }

  const show = (isoDay: string): void => {
    setHeld((current) => ({ ...current, day: isoDay }));
    open(START_CALENDAR_SHEET);
  };

  return { focusedDay: held.day, show };
};
