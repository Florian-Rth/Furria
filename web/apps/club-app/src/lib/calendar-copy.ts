export const CALENDAR_KIND_KEYS = ['plain', 'training', 'trip', 'event'] as const;
export type CalendarKindKey = (typeof CALENDAR_KIND_KEYS)[number];

export const CALENDAR_KIND_LABELS: Record<CalendarKindKey, string> = {
  plain: 'Allgemein',
  training: 'Training',
  trip: 'Ausflug',
  event: 'Veranstaltung',
};

export const ATTENDANCE_ANSWER_KEYS = ['yes', 'maybe', 'no'] as const;
export type AttendanceAnswerKey = (typeof ATTENDANCE_ANSWER_KEYS)[number];

export const ATTENDANCE_LABELS: Record<AttendanceAnswerKey, string> = {
  yes: 'Zusage',
  maybe: 'Vielleicht',
  no: 'Absage',
};

export const ATTENDANCE_ROLL_LABEL = 'Antworten';
export const ATTENDANCE_CLOSED_LABEL = 'Geschlossen';
export const ATTENDANCE_ROLL_LABELS: Record<AttendanceAnswerKey | 'open', string> = {
  ...ATTENDANCE_LABELS,
  open: 'Noch offen',
};

export const toOnBehalfLabel = (recordedBy: string): string => `durch ${recordedBy}`;

export const ATTENDANCE_SAVED_MESSAGES: Record<AttendanceAnswerKey, string> = {
  yes: 'Deine Zusage ist notiert.',
  maybe: 'Dein Vielleicht ist notiert.',
  no: 'Deine Absage ist notiert.',
};

export const toAttendanceChoiceLabel = (title: string): string => `Deine Antwort zu „${title}“`;

export const toAttendanceSavedMessage = (answer: AttendanceAnswerKey): string =>
  ATTENDANCE_SAVED_MESSAGES[answer];
