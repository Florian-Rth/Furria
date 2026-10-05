export const CALENDAR_KIND_KEYS = [
  'training',
  'rehearsal',
  'performance',
  'meeting',
  'party',
  'other',
] as const;
export type CalendarKindKey = (typeof CALENDAR_KIND_KEYS)[number];

export const CALENDAR_KIND_LABELS: Record<CalendarKindKey, string> = {
  training: 'Training',
  rehearsal: 'Probe',
  performance: 'Auftritt',
  meeting: 'Sitzung',
  party: 'Feier',
  other: 'Sonstiges',
};

export const ATTENDANCE_ANSWER_KEYS = ['yes', 'maybe', 'no'] as const;
export type AttendanceAnswerKey = (typeof ATTENDANCE_ANSWER_KEYS)[number];

export const ATTENDANCE_LABELS: Record<AttendanceAnswerKey, string> = {
  yes: 'Zusage',
  maybe: 'Vielleicht',
  no: 'Absage',
};

export const ATTENDANCE_SAVED_MESSAGES: Record<AttendanceAnswerKey, string> = {
  yes: 'Deine Zusage ist notiert.',
  maybe: 'Dein Vielleicht ist notiert.',
  no: 'Deine Absage ist notiert.',
};

export const toAttendanceChoiceLabel = (title: string): string => `Deine Antwort zu „${title}“`;

export const toAttendanceSavedMessage = (answer: AttendanceAnswerKey): string =>
  ATTENDANCE_SAVED_MESSAGES[answer];
