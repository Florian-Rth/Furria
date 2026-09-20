import { z } from 'zod';
import { CalendarEntryKindSchema } from '@/features/club';

export const CalendarEntryVisibilitySchema = z.enum(['group', 'club', 'public']);
export type CalendarEntryVisibility = z.infer<typeof CalendarEntryVisibilitySchema>;

export const AttendanceAnswerSchema = z.enum(['yes', 'no', 'maybe']);
export type AttendanceAnswer = z.infer<typeof AttendanceAnswerSchema>;

export const CalendarEntrySchema = z.object({
  calendarEntryId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  kind: CalendarEntryKindSchema,
  venueName: z.string().nullable(),
  ownerGroupId: z.number().int().nullable(),
  ownerGroupName: z.string().nullable(),
  visibility: CalendarEntryVisibilitySchema,
  asksForResponse: z.boolean(),
  description: z.string().nullable(),
  viewerAnswer: AttendanceAnswerSchema.nullable(),
  isRunning: z.boolean(),
});
export type CalendarEntry = z.infer<typeof CalendarEntrySchema>;

export const CalendarResponseSchema = z.object({ entries: z.array(CalendarEntrySchema) });
export type CalendarResponse = z.infer<typeof CalendarResponseSchema>;
