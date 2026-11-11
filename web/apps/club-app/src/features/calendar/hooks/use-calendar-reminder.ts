import { useId } from 'react';
import { useMinuteNow } from '@/lib/use-minute-now';
import { useCalendarReminderMutation } from '../api';
import { REMIND_LABEL, toReminderMetaLabel, toReminderQuestion } from '../calendar-labels';
import type { CalendarReminderSource, ReminderAvailability } from '../calendar-reminders';
import { toReminderAvailability, toReminderMeta } from '../calendar-reminders';
import type { CalendarConfirmCopy } from '../components/CalendarConfirmDialog';

const REMIND_COPY: Omit<CalendarConfirmCopy, 'question'> = {
  eyebrow: 'ERINNERN',
  explanation: 'Wer die App hat, bekommt eine Mitteilung.',
  confirmLabel: REMIND_LABEL,
  cancelLabel: 'Nicht jetzt',
  closeLabel: 'Abbrechen',
  tone: 'neutral',
};

export interface CalendarReminderControl {
  availability: ReminderAvailability;
  isDisabled: boolean;
  isReminding: boolean;
  metaId: string;
  metaLabel: string | null;
  copy: CalendarConfirmCopy;
  remind: () => void;
}

export const useCalendarReminder = (
  source: CalendarReminderSource | null,
): CalendarReminderControl | null => {
  const reminder = source?.reminder ?? null;
  const isThrottled = (reminder?.remindableFrom ?? null) !== null;
  const now = useMinuteNow(isThrottled);
  const reminding = useCalendarReminderMutation();
  const metaId = useId();

  if (source === null) {
    return null;
  }

  const availability = toReminderAvailability(source, now.getTime());
  const meta = toReminderMeta(availability, reminder, now);

  return {
    availability,
    isDisabled: availability !== 'ready',
    isReminding: reminding.isPending,
    metaId,
    metaLabel: meta === null ? null : toReminderMetaLabel(meta),
    copy: { ...REMIND_COPY, question: toReminderQuestion(reminder?.reachableCount ?? 0) },
    remind: () => {
      reminding.mutate(source.target);
    },
  };
};
