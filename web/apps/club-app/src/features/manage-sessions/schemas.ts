import { z } from 'zod';

export const SESSION_MOTTO_MAX_LENGTH = 160;
export const SESSION_LOGO_MAX_LENGTH = 200_000;
export const EARLIEST_SESSION_YEAR = 1900;
export const LATEST_SESSION_YEAR = 2100;

const SESSION_NUMBER_PATTERN = /^\d*$/;

export const SessionRecordSummarySchema = z.object({
  sessionId: z.number().int(),
  startYear: z.number().int(),
  number: z.number().int().nullable(),
  motto: z.string().nullable(),
  logoSvg: z.string().nullable(),
});
export type SessionRecordSummary = z.infer<typeof SessionRecordSummarySchema>;

export const SessionRecordsResponseSchema = z.object({
  sessions: z.array(SessionRecordSummarySchema),
});
export type SessionRecordsResponse = z.infer<typeof SessionRecordsResponseSchema>;

export const CreatedSessionRecordSchema = z.object({ sessionId: z.number().int() });
export type CreatedSessionRecord = z.infer<typeof CreatedSessionRecordSchema>;

export const SessionRecordFormSchema = z.object({
  startYear: z
    .number()
    .int()
    .min(EARLIEST_SESSION_YEAR, 'So weit zurück reicht der Verein nicht.')
    .max(LATEST_SESSION_YEAR, 'So weit voraus wird nicht eingetragen.')
    .nullable()
    .refine((year): boolean => year !== null, 'Sag, um welche Session es geht.'),
  number: z
    .string()
    .trim()
    .regex(SESSION_NUMBER_PATTERN, 'Die Nº ist eine Zahl — oder bleibt leer.'),
  motto: z
    .string()
    .trim()
    .max(SESSION_MOTTO_MAX_LENGTH, `Höchstens ${SESSION_MOTTO_MAX_LENGTH} Zeichen.`),
  logoSvg: z
    .string()
    .max(SESSION_LOGO_MAX_LENGTH, 'Diese SVG-Datei ist zu groß für einen Sessionseintrag.')
    .nullable(),
});
export type SessionRecordForm = z.infer<typeof SessionRecordFormSchema>;
