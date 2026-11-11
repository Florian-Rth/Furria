import { z } from 'zod';
import { birthDateOf } from './birth-date';

const FIRST_NAME_MESSAGE = 'Bitte gib deinen Vornamen ein.';
const LAST_NAME_MESSAGE = 'Bitte gib deinen Nachnamen ein.';
const BIRTH_DATE_MESSAGE = 'Bitte gib ein gültiges Geburtsdatum ein, zum Beispiel 07 03 1961.';

export const ClaimWindowStatusSchema = z.object({
  isOpen: z.boolean(),
  closesAt: z.iso.datetime({ offset: true }).nullable(),
});
export type ClaimWindowStatus = z.infer<typeof ClaimWindowStatusSchema>;

export const WindowClaimOutcomeSchema = z.enum([
  'invited',
  'hasAccount',
  'hasEmail',
  'underAge',
  'notFound',
  'closed',
]);
export type WindowClaimOutcome = z.infer<typeof WindowClaimOutcomeSchema>;

export const WindowClaimResultSchema = z.object({
  outcome: WindowClaimOutcomeSchema,
  token: z.string().nullable(),
});
export type WindowClaimResult = z.infer<typeof WindowClaimResultSchema>;

export const ClaimWindowSpanSchema = z.object({
  openedAt: z.iso.datetime({ offset: true }),
  closesAt: z.iso.datetime({ offset: true }),
});
export type ClaimWindowSpan = z.infer<typeof ClaimWindowSpanSchema>;

export const WindowClaimSummarySchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  claimedAt: z.iso.datetime({ offset: true }),
  hasAccount: z.boolean(),
});
export type WindowClaimSummary = z.infer<typeof WindowClaimSummarySchema>;

export const ClaimWindowOverviewSchema = z.object({
  window: ClaimWindowSpanSchema.nullable(),
  claims: z.array(WindowClaimSummarySchema),
});
export type ClaimWindowOverview = z.infer<typeof ClaimWindowOverviewSchema>;

export const WindowClaimFormSchema = z
  .object({
    firstName: z.string().trim().min(1, FIRST_NAME_MESSAGE),
    lastName: z.string().trim().min(1, LAST_NAME_MESSAGE),
    day: z.string(),
    month: z.string(),
    year: z.string(),
  })
  .refine((form) => birthDateOf(form.day, form.month, form.year) !== null, {
    message: BIRTH_DATE_MESSAGE,
    path: ['day'],
  });
export type WindowClaimForm = z.infer<typeof WindowClaimFormSchema>;
