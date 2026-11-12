import type { CalendarFieldError } from '@/features/calendar/calendar-field-error';
import { toAnswerCountLabel } from '@/features/calendar/calendar-labels';
import { hasNoAnswersUntil, toAnswerCountOf, toHeldAttendance } from '../announcement-add-ons';
import type { Announcement, AnnouncementAttendanceForm } from '../schemas';
import type { AnnouncementAddOnsEditor } from './use-announcement-add-ons-editor';

export interface AnnouncementAttendanceCardControl {
  fieldNames: { answersUntilDay: string; answersUntilTime: string };
  metaLabel: string | undefined;
  isFrozen: boolean;
  isTimeLocked: boolean;
  deadlineError: CalendarFieldError;
  setAnswersUntilDay: (day: string | null) => void;
  setAnswersUntilTime: (time: string) => void;
}

interface AnnouncementAttendanceCardInput {
  editor: AnnouncementAddOnsEditor;
  index: number;
  attendance: AnnouncementAttendanceForm;
  announcement: Announcement | null;
}

export const useAnnouncementAttendanceCard = ({
  editor,
  index,
  attendance,
  announcement,
}: AnnouncementAttendanceCardInput): AnnouncementAttendanceCardControl => {
  const held = toHeldAttendance(announcement);
  const isFrozen = held?.isClosed === true;
  const answerCount = held === null ? 0 : toAnswerCountOf(held);

  return {
    fieldNames: {
      answersUntilDay: `addOns.${index}.attendance.answersUntilDay`,
      answersUntilTime: `addOns.${index}.attendance.answersUntilTime`,
    },
    metaLabel: toAnswerCountLabel(answerCount),
    isFrozen,
    isTimeLocked: isFrozen || hasNoAnswersUntil(attendance),
    deadlineError: editor.answersUntilErrorAt(index),
    setAnswersUntilDay: (day) => {
      editor.setAnswersUntilDay(index, day);
    },
    setAnswersUntilTime: (time) => {
      editor.setAnswersUntilTime(index, time);
    },
  };
};
