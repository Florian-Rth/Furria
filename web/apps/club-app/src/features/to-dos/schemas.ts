export const TO_DO_KINDS = [
  'neverInvited',
  'reminderDue',
  'inPersonOnly',
  'birthDateUnknown',
  'keyToTakeBack',
  'clubRecordGap',
  'applicationWaiting',
] as const;
export type ToDoKind = (typeof TO_DO_KINDS)[number];
