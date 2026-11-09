import { z } from 'zod';
import {
  GroupRefSchema,
  HonoursSchema,
  MembershipStateSchema,
  PictureSchema,
} from '@/lib/api/schemas';
import { ClubIconSchema } from '@/lib/club-icon';

export const MemberSummarySchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  portrait: PictureSchema.nullable(),
  membershipState: MembershipStateSchema,
  groups: z.array(GroupRefSchema),
  honours: HonoursSchema,
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

export const MemberBoardTermSchema = z.object({
  boardOfficeId: z.number().int(),
  office: z.string(),
  icon: ClubIconSchema.nullable(),
  since: z.iso.date(),
  until: z.iso.date().nullable(),
});
export type MemberBoardTerm = z.infer<typeof MemberBoardTermSchema>;

export const MemberDetailsSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  portrait: PictureSchema.nullable(),
  membershipState: MembershipStateSchema,
  memberSince: z.iso.date().nullable(),
  groups: z.array(MemberGroupSchema),
  boardTerms: z.array(MemberBoardTermSchema),
  contact: MemberContactSchema,
  honours: HonoursSchema,
});
export type MemberDetails = z.infer<typeof MemberDetailsSchema>;
