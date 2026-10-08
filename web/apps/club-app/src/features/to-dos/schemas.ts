import { z } from 'zod';

export const TO_DO_KINDS = [
  'neverInvited',
  'reminderDue',
  'inPersonOnly',
  'birthDateUnknown',
  'keyToTakeBack',
  'clubRecordGap',
  'applicationWaiting',
  'ticketRequestWaiting',
] as const;
export type ToDoKind = (typeof TO_DO_KINDS)[number];

export const ToDoSchema = z.object({
  kind: z.enum(TO_DO_KINDS),
  count: z.int().positive(),
  isSeen: z.boolean(),
  newCount: z.int().nonnegative(),
  version: z.string(),
});
export type ToDo = z.infer<typeof ToDoSchema>;
