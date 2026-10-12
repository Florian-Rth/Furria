import { z } from 'zod';
import { ATTENDANCE_ANSWER_KEYS } from '@/lib/calendar-copy';

export const AttendanceAnswerSchema = z.enum(ATTENDANCE_ANSWER_KEYS);
export type AttendanceAnswer = z.infer<typeof AttendanceAnswerSchema>;

export const AttendanceResponseSchema = z.object({
  calendarEntryId: z.int(),
  answer: AttendanceAnswerSchema,
});
export type AttendanceResponse = z.infer<typeof AttendanceResponseSchema>;
