import { toDiscardedAnswerCount, toOfferedAddOns } from '../calendar-add-ons';
import type { CalendarAddOnCardForm, CalendarEntry } from '../schemas';
import type { CalendarAddOnsControl } from './use-calendar-add-ons';
import { useCalendarAddOns } from './use-calendar-add-ons';
import type { CalendarEntryEditorControl } from './use-calendar-entry-editor';

const ADD_ON_SHEET_ID = 'calendar-add-on';

export const useCalendarEntryAddOns = (
  control: CalendarEntryEditorControl,
  entry: CalendarEntry | null,
): CalendarAddOnsControl<CalendarAddOnCardForm> =>
  useCalendarAddOns({
    sheetId: ADD_ON_SHEET_ID,
    offered: toOfferedAddOns(control.values.addOns),
    attach: control.attachAddOn,
    detach: control.detachAddOn,
    discardedAnswersOf: (card) => toDiscardedAnswerCount(card, entry),
  });
