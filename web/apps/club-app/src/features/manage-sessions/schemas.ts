import { z } from 'zod';
import { AppSearchSchema } from '@/features/session/schemas';
import { MediaItemStateSchema, SessionLogoSchema } from '@/lib/api/schemas';

export const SESSION_MOTTO_MAX_LENGTH = 160;
export const EARLIEST_SESSION_YEAR = 1900;
export const LATEST_SESSION_YEAR = 2100;

const SESSION_NUMBER_PATTERN = /^\d*$/;

export const SessionLogoEditingSchema = z.object({
  state: MediaItemStateSchema,
  isStalled: z.boolean(),
  logo: SessionLogoSchema.nullable(),
});
export type SessionLogoEditing = z.infer<typeof SessionLogoEditingSchema>;

export const SessionRecordSummarySchema = z.object({
  sessionId: z.number().int(),
  startYear: z.number().int(),
  number: z.number().int().nullable(),
  motto: z.string().nullable(),
  logo: SessionLogoEditingSchema.nullable(),
});
export type SessionRecordSummary = z.infer<typeof SessionRecordSummarySchema>;

export const SessionRecordsResponseSchema = z.object({
  sessions: z.array(SessionRecordSummarySchema),
});
export type SessionRecordsResponse = z.infer<typeof SessionRecordsResponseSchema>;

export const CreatedSessionRecordSchema = z.object({ sessionId: z.number().int() });
export type CreatedSessionRecord = z.infer<typeof CreatedSessionRecordSchema>;

export const SessionNewSearchSchema = AppSearchSchema.extend({
  startYear: z
    .number()
    .int()
    .min(EARLIEST_SESSION_YEAR)
    .max(LATEST_SESSION_YEAR)
    .optional()
    .catch(undefined),
});
export type SessionNewSearch = z.infer<typeof SessionNewSearchSchema>;

export const SessionRecordFormSchema = z.object({
  startYear: z
    .number()
    .int()
    .min(EARLIEST_SESSION_YEAR, 'Dieses Jahr liegt zu weit zurück.')
    .max(LATEST_SESSION_YEAR, 'Dieses Jahr liegt zu weit in der Zukunft.')
    .nullable()
    .refine((year): boolean => year !== null, 'Die Session fehlt.'),
  number: z
    .string()
    .trim()
    .regex(SESSION_NUMBER_PATTERN, 'Die Sessionsnummer muss eine Zahl sein.'),
  motto: z
    .string()
    .trim()
    .max(SESSION_MOTTO_MAX_LENGTH, `Höchstens ${SESSION_MOTTO_MAX_LENGTH} Zeichen.`),
});
export type SessionRecordForm = z.infer<typeof SessionRecordFormSchema>;
