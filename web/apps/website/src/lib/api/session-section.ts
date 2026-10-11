import { z } from 'zod';
import type { Session } from '@/lib/club';
import { sessionStartingIn } from '@/lib/club';

export interface NumberedSession extends Session {
  number: number | null;
}

const toNumberedSession = (startYear: number, number: number | null): NumberedSession => ({
  ...sessionStartingIn(startYear),
  number,
});

const SessionFieldsSchema = z.object({
  sessionStartYear: z.number().int(),
  sessionNumber: z.number().int().positive().nullable(),
});

export const SessionSectionSchema = <T extends z.ZodRawShape>(itemShape: T) =>
  SessionFieldsSchema.and(z.object(itemShape)).transform(
    ({ sessionStartYear, sessionNumber, ...item }) => ({
      ...item,
      session: toNumberedSession(sessionStartYear, sessionNumber),
    }),
  );
