import type { KkStampTone } from '@furria/ui';
import type { CalendarLineInput, CalendarLineView } from './use-calendar-line';
import { useCalendarLine } from './use-calendar-line';

export interface CalendarSheetLineInput extends CalendarLineInput {
  chosenDay: boolean;
  dayHead: boolean;
}

export interface CalendarSheetLineView extends CalendarLineView {
  eyebrowTone: KkStampTone;
  flash: boolean;
}

const ACCENT_TONE: KkStampTone = 'today';

export const useCalendarSheetLine = ({
  chosenDay,
  dayHead,
  ...input
}: CalendarSheetLineInput): CalendarSheetLineView => {
  const line = useCalendarLine(input);
  const accented = chosenDay && dayHead && line.stamp.tone === 'plain';

  return {
    ...line,
    eyebrowTone: accented ? ACCENT_TONE : line.stamp.tone,
    flash: line.highlight || chosenDay,
  };
};
