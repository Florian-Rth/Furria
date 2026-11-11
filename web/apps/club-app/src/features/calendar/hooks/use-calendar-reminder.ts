import { useMinuteNow } from '@/lib/use-minute-now';
import { useCalendarReminderMutation } from '../api';
import { toRemindedLabel, toReminderQuestion } from '../calendar-labels';
import type { CalendarReminderSource, ReminderAvailability } from '../calendar-reminders';
import { toReminderAvailability } from '../calendar-reminders';
import type { CalendarConfirmCopy } from '../components/CalendarConfirmDialog';

const REMIND_COPY: Omit<CalendarConfirmCopy, 'question'> = {
  eyebrow: 'ERINNERN',
  explanation: 'Wer die App hat, bekommt eine Mitteilung.',
  confirmLabel: 'Erinnern',
  cancelLabel: 'Nicht jetzt',
  closeLabel: 'Abbrechen',
};

export interface CalendarReminderControl {
  availability: ReminderAvailability;
  isReminding: boolean;
  remindedLabel: string | null;
  copy: CalendarConfirmCopy;
  remind: () => void;
}

export const useCalendarReminder = (source: CalendarReminderSource): CalendarReminderControl => {
  const now = useMinuteNow();
  const reminding = useCalendarReminderMutation();
  const openCount = source.notAnswered?.length ?? 0;

  return {
    availability: toReminderAvailability(source, now.getTime()),
    isReminding: reminding.isPending,
    remindedLabel: toRemindedLabel(source.reminder?.lastRemindedAt ?? null, now),
    copy: { ...REMIND_COPY, question: toReminderQuestion(openCount) },
    remind: () => {
      reminding.mutate(source.target);
    },
  };
};
