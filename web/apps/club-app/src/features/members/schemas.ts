import { z } from 'zod';
import { GroupRefSchema, MembershipStateSchema, RoleRefSchema } from '@/lib/api/schemas';

export const MemberSummarySchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  membershipState: MembershipStateSchema,
  groups: z.array(GroupRefSchema),
  roles: z.array(RoleRefSchema),
});
export type MemberSummary = z.infer<typeof MemberSummarySchema>;

export const MembersResponseSchema = z.object({ members: z.array(MemberSummarySchema) });
export type MembersResponse = z.infer<typeof MembersResponseSchema>;

export const ContactVisibilitySchema = z.enum(['shared', 'hidden', 'revealedByPermission']);
export type ContactVisibility = z.infer<typeof ContactVisibilitySchema>;

export const MemberContactSchema = z.object({
  visibility: ContactVisibilitySchema,
  phone: z.string().nullable(),
  email: z.string().nullable(),
  street: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
});
export type MemberContact = z.infer<typeof MemberContactSchema>;

export const MemberGroupSchema = GroupRefSchema.extend({ since: z.iso.date() });
export type MemberGroup = z.infer<typeof MemberGroupSchema>;

export const MemberRoleSchema = RoleRefSchema.extend({ since: z.iso.date() });
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const MemberDetailsSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  membershipState: MembershipStateSchema,
  memberSince: z.iso.date().nullable(),
  groups: z.array(MemberGroupSchema),
  roles: z.array(MemberRoleSchema),
  contact: MemberContactSchema,
});
export type MemberDetails = z.infer<typeof MemberDetailsSchema>;
