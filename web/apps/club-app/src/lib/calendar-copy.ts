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

export const ATTENDANCE_ANSWER_KEYS = ['yes', 'no', 'maybe'] as const;
export type AttendanceAnswerKey = (typeof ATTENDANCE_ANSWER_KEYS)[number];

export const ATTENDANCE_LABELS: Record<AttendanceAnswerKey, string> = {
  yes: 'Zusage',
  no: 'Absage',
  maybe: 'Vielleicht',
};

export const ATTENDANCE_SAVED_MESSAGES: Record<AttendanceAnswerKey, string> = {
  yes: 'Deine Zusage ist notiert.',
  no: 'Deine Absage ist notiert.',
  maybe: 'Dein Vielleicht ist notiert.',
};

export interface AttendanceChoice {
  answer: AttendanceAnswerKey;
  label: string;
  selected: boolean;
}

export const toAttendanceChoices = (viewerAnswer: AttendanceAnswerKey | null): AttendanceChoice[] =>
  ATTENDANCE_ANSWER_KEYS.map((answer) => ({
    answer,
    label: ATTENDANCE_LABELS[answer],
    selected: answer === viewerAnswer,
  }));

export const toAttendanceSavedMessage = (answer: AttendanceAnswerKey): string =>
  ATTENDANCE_SAVED_MESSAGES[answer];
