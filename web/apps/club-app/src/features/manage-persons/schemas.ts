import { z } from 'zod';
import { AppSearchSchema } from '@/features/session';
import { GroupRefSchema, MembershipStateSchema, RoleRefSchema } from '@/lib/api/schemas';
import { requiredDay, requiredSessionYear } from '@/lib/required-fields';

export const FeeReductionBasisSchema = z.enum(['minor', 'school', 'apprenticeship', 'studies']);
export type FeeReductionBasis = z.infer<typeof FeeReductionBasisSchema>;

const PersonContactSchema = z.object({
  email: z.string().nullable(),
  phone: z.string().nullable(),
  street: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
  birthDate: z.iso.date().nullable(),
  contactVisibleToMembers: z.boolean(),
});

export const PersonSummarySchema = z
  .object({
    personId: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
    membershipState: MembershipStateSchema,
    memberSince: z.iso.date().nullable(),
    groups: z.array(GroupRefSchema),
    roles: z.array(RoleRefSchema),
  })
  .extend(PersonContactSchema.shape);
export type PersonSummary = z.infer<typeof PersonSummarySchema>;

export const PersonsResponseSchema = z.object({ persons: z.array(PersonSummarySchema) });
export type PersonsResponse = z.infer<typeof PersonsResponseSchema>;

export const PersonPauseSchema = z.object({
  pauseId: z.number().int(),
  firstSessionYear: z.number().int(),
  lastSessionYear: z.number().int().nullable(),
});
export type PersonPause = z.infer<typeof PersonPauseSchema>;

export const PersonMembershipSchema = z.object({
  membershipId: z.number().int(),
  startedOn: z.iso.date(),
  endedOn: z.iso.date().nullable(),
  isRunning: z.boolean(),
  isFuture: z.boolean(),
  pauses: z.array(PersonPauseSchema),
});
export type PersonMembership = z.infer<typeof PersonMembershipSchema>;

export const PersonFeeReductionSchema = z.object({
  feeReductionId: z.number().int(),
  basis: FeeReductionBasisSchema,
  firstSessionYear: z.number().int(),
  lastSessionYear: z.number().int(),
});
export type PersonFeeReduction = z.infer<typeof PersonFeeReductionSchema>;

export const PersonGroupSchema = GroupRefSchema.extend({
  joinedOn: z.iso.date(),
  leftOn: z.iso.date().nullable(),
});
export type PersonGroup = z.infer<typeof PersonGroupSchema>;

export const PersonRoleSchema = RoleRefSchema.extend({
  sinceOn: z.iso.date(),
  untilOn: z.iso.date().nullable(),
});
export type PersonRole = z.infer<typeof PersonRoleSchema>;

export const PersonDetailsSchema = z
  .object({
    personId: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
    membershipState: MembershipStateSchema,
    memberSince: z.iso.date().nullable(),
    memberships: z.array(PersonMembershipSchema),
    feeReductions: z.array(PersonFeeReductionSchema),
    groups: z.array(PersonGroupSchema),
    roles: z.array(PersonRoleSchema),
  })
  .extend(PersonContactSchema.shape);
export type PersonDetails = z.infer<typeof PersonDetailsSchema>;

export const CreatedPersonSchema = z.object({ personId: z.number().int() });
export type CreatedPerson = z.infer<typeof CreatedPersonSchema>;

export const CreatedMembershipSchema = z.object({ membershipId: z.number().int() });
export type CreatedMembership = z.infer<typeof CreatedMembershipSchema>;

export const CreatedPauseSchema = z.object({ pauseId: z.number().int() });
export type CreatedPause = z.infer<typeof CreatedPauseSchema>;

export const CreatedFeeReductionSchema = z.object({ feeReductionId: z.number().int() });
export type CreatedFeeReduction = z.infer<typeof CreatedFeeReductionSchema>;

const FIRST_NAME_MAX = 128;
const LAST_NAME_MAX = 128;
const EMAIL_MAX = 256;
const PHONE_MAX = 64;
const STREET_MAX = 256;
const ZIP_MAX = 16;
const CITY_MAX = 128;

const isEmailOrEmpty = (value: string): boolean =>
  value === '' || z.email().safeParse(value).success;

export const PersonFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Der Vorname fehlt.').max(FIRST_NAME_MAX),
  lastName: z.string().trim().min(1, 'Der Nachname fehlt.').max(LAST_NAME_MAX),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX)
    .refine(isEmailOrEmpty, { message: 'Bitte gib eine gültige E-Mail-Adresse ein.' }),
  phone: z.string().trim().max(PHONE_MAX),
  street: z.string().trim().max(STREET_MAX),
  zip: z.string().trim().max(ZIP_MAX),
  city: z.string().trim().max(CITY_MAX),
  birthDate: z.iso.date().nullable(),
  contactVisibleToMembers: z.boolean(),
});
export type PersonForm = z.infer<typeof PersonFormSchema>;

export const MembershipFormSchema = z.object({
  startedOn: requiredDay('Der erste Tag fehlt.'),
  endedOn: z.iso.date().nullable(),
});
export type MembershipForm = z.infer<typeof MembershipFormSchema>;

export const PauseNewSearchSchema = AppSearchSchema.extend({
  membership: z.string().optional().catch(undefined),
});
export type PauseNewSearch = z.infer<typeof PauseNewSearchSchema>;

const FIRST_SESSION_MISSING = 'Die erste Session fehlt.';

export const PauseFormSchema = z.object({
  firstSessionYear: requiredSessionYear(FIRST_SESSION_MISSING),
  lastSessionYear: z.number().int().nullable(),
});
export type PauseForm = z.infer<typeof PauseFormSchema>;

export const FeeReductionFormSchema = z.object({
  basis: FeeReductionBasisSchema,
  firstSessionYear: requiredSessionYear(FIRST_SESSION_MISSING),
  lastSessionYear: requiredSessionYear('Die letzte Session fehlt.'),
});
export type FeeReductionForm = z.infer<typeof FeeReductionFormSchema>;
