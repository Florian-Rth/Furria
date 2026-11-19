import { z } from 'zod';
import { AppSearchSchema } from '@/features/session/schemas';
import { PictureSchema } from '@/lib/api/schemas';

export const INTAKE_LABEL_MAX_LENGTH = 80;
export const MEMBER_FROM_MISSING_MESSAGE = 'Ab wann ist sie Mitglied?';
export const NO_AFFILIATION_MESSAGE = 'Wähle eine Gruppe oder die Mitgliedschaft.';
export const LABEL_TOO_LONG_MESSAGE = `Höchstens ${INTAKE_LABEL_MAX_LENGTH} Zeichen.`;

export const IntakeStateSchema = z.enum([
  'open',
  'expired',
  'needsReview',
  'completed',
  'discarded',
]);
export type IntakeState = z.infer<typeof IntakeStateSchema>;

export const IntakeMatchSchema = z.enum(['email', 'nameAndBirthDate']);
export type IntakeMatch = z.infer<typeof IntakeMatchSchema>;

export const IntakePersonSchema = z.object({
  personId: z.number().int().nullable(),
  firstName: z.string(),
  lastName: z.string(),
});
export type IntakePerson = z.infer<typeof IntakePersonSchema>;

export const IntakeGroupSchema = z.object({ groupId: z.number().int(), name: z.string() });
export type IntakeGroup = z.infer<typeof IntakeGroupSchema>;

export const IntakeSummarySchema = z.object({
  intakeId: z.number().int(),
  state: IntakeStateSchema,
  label: z.string().nullable(),
  newcomer: IntakePersonSchema.nullable(),
  memberFrom: z.iso.date().nullable(),
  groups: z.array(IntakeGroupSchema),
  startedBy: IntakePersonSchema.nullable(),
  canManage: z.boolean(),
  createdAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
  submittedAt: z.iso.datetime({ offset: true }).nullable(),
  completedAt: z.iso.datetime({ offset: true }).nullable(),
  discardedAt: z.iso.datetime({ offset: true }).nullable(),
});
export type IntakeSummary = z.infer<typeof IntakeSummarySchema>;

export const IntakesResponseSchema = z.object({ intakes: z.array(IntakeSummarySchema) });
export type IntakesResponse = z.infer<typeof IntakesResponseSchema>;

export const IntakeNewcomerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.iso.date(),
  street: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  contactVisibleToMembers: z.boolean(),
  portrait: PictureSchema.nullable(),
});
export type IntakeNewcomer = z.infer<typeof IntakeNewcomerSchema>;

export const IntakeCandidateSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.iso.date().nullable(),
  match: IntakeMatchSchema,
  isMember: z.boolean(),
  groups: z.array(z.string()),
  hasAccount: z.boolean(),
  portrait: PictureSchema.nullable(),
});
export type IntakeCandidate = z.infer<typeof IntakeCandidateSchema>;

export const IntakeReviewSchema = z.object({
  newcomer: IntakeNewcomerSchema,
  candidates: z.array(IntakeCandidateSchema),
});
export type IntakeReview = z.infer<typeof IntakeReviewSchema>;

export const IntakeDetailsSchema = z.object({
  intake: IntakeSummarySchema,
  token: z.string().nullable(),
  review: IntakeReviewSchema.nullable(),
});
export type IntakeDetails = z.infer<typeof IntakeDetailsSchema>;

export const StartedIntakeSchema = z.object({
  intakeId: z.number().int(),
  token: z.string(),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type StartedIntake = z.infer<typeof StartedIntakeSchema>;

export const RenewedIntakeSchema = z.object({
  token: z.string(),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type RenewedIntake = z.infer<typeof RenewedIntakeSchema>;

export const ResolvedIntakeSchema = z.object({ personId: z.number().int() });
export type ResolvedIntake = z.infer<typeof ResolvedIntakeSchema>;

export const IntakeNewSearchSchema = AppSearchSchema.extend({
  group: z.number().int().positive().optional().catch(undefined),
});
export type IntakeNewSearch = z.infer<typeof IntakeNewSearchSchema>;

export const IntakeFormSchema = z
  .object({
    isMember: z.boolean(),
    memberFrom: z.iso.date().nullable(),
    groupIds: z.array(z.string()),
    label: z.string().trim().max(INTAKE_LABEL_MAX_LENGTH, LABEL_TOO_LONG_MESSAGE),
  })
  .refine((form) => !form.isMember || form.memberFrom !== null, {
    message: MEMBER_FROM_MISSING_MESSAGE,
    path: ['memberFrom'],
  })
  .refine((form) => form.isMember || form.groupIds.length > 0, {
    message: NO_AFFILIATION_MESSAGE,
    path: ['groupIds'],
  });
export type IntakeForm = z.infer<typeof IntakeFormSchema>;
