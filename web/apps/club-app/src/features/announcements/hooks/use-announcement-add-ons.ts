import type { CalendarAddOnsControl } from '@/features/calendar/hooks/use-calendar-add-ons';
import { useCalendarAddOns } from '@/features/calendar/hooks/use-calendar-add-ons';
import {
  toDiscardedAnnouncementAnswers,
  toOfferedAnnouncementAddOns,
} from '../announcement-add-ons';
import type { Announcement, AnnouncementAddOnCardForm } from '../schemas';
import type { AnnouncementAddOnsEditor } from './use-announcement-add-ons-editor';

const ADD_ON_SHEET_ID = 'announcement-add-on';

export const useAnnouncementAddOns = (
  editor: AnnouncementAddOnsEditor,
  cards: readonly AnnouncementAddOnCardForm[],
  announcement: Announcement | null,
): CalendarAddOnsControl<AnnouncementAddOnCardForm> =>
  useCalendarAddOns({
    sheetId: ADD_ON_SHEET_ID,
    offered: toOfferedAnnouncementAddOns(cards),
    attach: editor.attachAddOn,
    detach: editor.detachAddOn,
    discardedAnswersOf: (card) => toDiscardedAnnouncementAnswers(card, announcement),
  });
