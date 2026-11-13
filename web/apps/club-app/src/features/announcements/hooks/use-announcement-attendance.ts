import { toAttendanceDims } from '@/features/attendance/attendance-answer';
import { toAttendanceRoll } from '@/features/calendar/calendar-attendance';
import { toAttendanceReminderSource } from '@/features/calendar/calendar-reminders';
import type { CalendarConfirmCopy } from '@/features/calendar/components/CalendarConfirmDialog';
import type { CalendarDetailAttendanceControl } from '@/features/calendar/hooks/use-calendar-detail-attendance';
import { ATTENDANCE_ROLL_COPY } from '@/features/calendar/hooks/use-calendar-detail-attendance';
import { useNamesSheet } from '@/features/calendar/hooks/use-names-sheet';
import { useMeQuery } from '@/features/session/api';
import { toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import { toAttendanceCloseQuestion, toAttendanceMetaLabel } from '../announcements-labels';
import { useAnnouncementAnswerMutation, useAnnouncementAttendanceClosingMutation } from '../api';
import type { Announcement, AnnouncementAttendance } from '../schemas';

const CLOSE_COPY: Omit<CalendarConfirmCopy, 'question'> = {
  eyebrow: 'ZU-/ABSAGE SCHLIESSEN',
  explanation: 'Danach kann niemand mehr zu- oder absagen.',
  confirmLabel: 'Schließen',
  cancelLabel: 'Offen lassen',
  closeLabel: 'Abbrechen',
};

export interface AnnouncementAttendanceControl extends CalendarDetailAttendanceControl {
  meta: string;
  canClose: boolean;
  isClosing: boolean;
  closeCopy: CalendarConfirmCopy;
  close: () => void;
}

export const useAnnouncementAttendance = (
  announcement: Announcement,
  attendance: AnnouncementAttendance,
): AnnouncementAttendanceControl => {
  const { announcementId } = announcement;
  const answering = useAnnouncementAnswerMutation(announcementId);
  const closing = useAnnouncementAttendanceClosingMutation();
  const ownPersonId = useMeQuery().data?.person?.id ?? null;
  const sheet = useNamesSheet();
  const pendingAnswer = answering.isPending ? (answering.variables ?? null) : null;
  const dimsAnswer = toAttendanceDims(answering.error);

  return {
    answer: announcement.viewerMayAnswer
      ? {
          label: toAttendanceChoiceLabel(announcement.title),
          value: pendingAnswer ?? announcement.viewerAnswer,
          error: undefined,
          disabled: attendance.isClosed || answering.isPending || dimsAnswer,
          choose: (answer) => {
            answering.mutate(answer);
          },
        }
      : null,
    roll: toAttendanceRoll(attendance, ownPersonId, ATTENDANCE_ROLL_COPY),
    reminder: toAttendanceReminderSource({ kind: 'announcement', announcementId }, attendance),
    sheet,
    meta: toAttendanceMetaLabel(attendance),
    canClose: announcement.viewerMayEdit && !attendance.isClosed,
    isClosing: closing.isPending,
    closeCopy: { ...CLOSE_COPY, question: toAttendanceCloseQuestion(announcement.title) },
    close: () => {
      closing.mutate(announcementId);
    },
  };
};
