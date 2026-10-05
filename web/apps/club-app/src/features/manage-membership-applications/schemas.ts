import { z } from 'zod';
import { MembershipStateSchema } from '@/lib/api/schemas';
import { requiredDay } from '@/lib/required-fields';
import { isBeforeApplication, needsGuardianConsent } from './admission';

export const MembershipApplicationSummarySchema = z.object({
  membershipApplicationId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  age: z.number().int(),
  isMinor: z.boolean(),
  city: z.string(),
  confirmedAt: z.iso.datetime({ offset: true }),
});
export type MembershipApplicationSummary = z.infer<typeof MembershipApplicationSummarySchema>;

export const MembershipApplicationsResponseSchema = z.object({
  applications: z.array(MembershipApplicationSummarySchema),
});
export type MembershipApplicationsResponse = z.infer<typeof MembershipApplicationsResponseSchema>;

export const RegistryGapSchema = z.enum(['birthDate', 'email', 'phone', 'address']);
export type RegistryGap = z.infer<typeof RegistryGapSchema>;

export const AdmissionCandidateSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.iso.date().nullable(),
  email: z.string().nullable(),
  city: z.string().nullable(),
  membershipState: MembershipStateSchema,
  memberSince: z.iso.date().nullable(),
  isMember: z.boolean(),
  groups: z.array(z.string()),
  roles: z.array(z.string()),
  hasAccount: z.boolean(),
  isAffiliated: z.boolean(),
  gaps: z.array(RegistryGapSchema),
});
export type AdmissionCandidate = z.infer<typeof AdmissionCandidateSchema>;

export const MembershipApplicationDetailsSchema = z.object({
  membershipApplicationId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.iso.date(),
  age: z.number().int(),
  isMinor: z.boolean(),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  submittedAt: z.iso.datetime({ offset: true }),
  confirmedAt: z.iso.datetime({ offset: true }),
  appliedOn: z.iso.date(),
  ageOfConsent: z.number().int(),
  candidates: z.array(AdmissionCandidateSchema),
});
export type MembershipApplicationDetails = z.infer<typeof MembershipApplicationDetailsSchema>;

export const AdmissionInvitationSchema = z.enum([
  'sent',
  'alreadyHasAccount',
  'notYetAffiliated',
  'belowAgeOfConsent',
]);
export type AdmissionInvitation = z.infer<typeof AdmissionInvitationSchema>;

export const AdmissionResultSchema = z.object({
  personId: z.number().int(),
  membershipId: z.number().int(),
  invitation: AdmissionInvitationSchema,
});
export type AdmissionResult = z.infer<typeof AdmissionResultSchema>;

export const AdmissionFormSchema = z
  .object({
    choice: z.string().nullable(),
    admittedOn: requiredDay('Das Aufnahmedatum fehlt.'),
    guardianConsentConfirmed: z.boolean(),
    appliedOn: z.iso.date(),
    birthDate: z.iso.date(),
  })
  .refine((form) => form.choice !== null, {
    message: 'Wähle, ob sie schon im Register steht.',
    path: ['choice'],
  })
  .refine((form) => !isBeforeApplication(form.admittedOn, form.appliedOn), {
    message: 'Frühestens am Tag ihres Antrags.',
    path: ['admittedOn'],
  })
  .refine(
    (form) =>
      form.guardianConsentConfirmed || !needsGuardianConsent(form.birthDate, form.admittedOn),
    {
      message: 'Ohne die Einwilligung der gesetzlichen Vertretung geht es nicht.',
      path: ['guardianConsentConfirmed'],
    },
  );
export type AdmissionForm = z.infer<typeof AdmissionFormSchema>;
