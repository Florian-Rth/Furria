import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

export const MyGroupSummarySchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  isMember: z.boolean(),
  isAdmin: z.boolean(),
});
export type MyGroupSummary = z.infer<typeof MyGroupSummarySchema>;

export const MyGroupsResponseSchema = z.object({ groups: z.array(MyGroupSummarySchema) });
export type MyGroupsResponse = z.infer<typeof MyGroupsResponseSchema>;

export const HubMemberSchema = PersonRefSchema.extend({
  groupMembershipId: z.number().int(),
  joinedOn: z.iso.date(),
  leftOn: z.iso.date().nullable(),
  since: z.iso.date(),
});
export type HubMember = z.infer<typeof HubMemberSchema>;

export const HubAdminSchema = PersonRefSchema.extend({
  groupAdminId: z.number().int(),
  function: z.string().nullable(),
  sinceOn: z.iso.date(),
  untilOn: z.iso.date().nullable(),
  since: z.iso.date(),
});
export type HubAdmin = z.infer<typeof HubAdminSchema>;

export const HubDetailsSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  viewerIsAdmin: z.boolean(),
  members: z.array(HubMemberSchema),
  admins: z.array(HubAdminSchema),
  pastMembers: z.array(HubMemberSchema),
  pastAdmins: z.array(HubAdminSchema),
});
export type HubDetails = z.infer<typeof HubDetailsSchema>;

export const PersonSearchResponseSchema = z.object({ persons: z.array(PersonRefSchema) });
export type PersonSearchResponse = z.infer<typeof PersonSearchResponseSchema>;

export const AddedGroupMembershipSchema = z.object({ groupMembershipId: z.number().int() });
export type AddedGroupMembership = z.infer<typeof AddedGroupMembershipSchema>;

export const GroupInfoFormSchema = z.object({
  description: z.string().max(400),
  isRecruiting: z.boolean(),
});
export type GroupInfoForm = z.infer<typeof GroupInfoFormSchema>;

export const AddGroupMembershipFormSchema = z.object({
  personId: z.number().int().positive(),
  joinedOn: z.iso.date(),
});
export type AddGroupMembershipForm = z.infer<typeof AddGroupMembershipFormSchema>;

export const EndGroupMembershipFormSchema = z.object({
  groupMembershipId: z.number().int().positive(),
  endedOn: z.iso.date(),
});
export type EndGroupMembershipForm = z.infer<typeof EndGroupMembershipFormSchema>;

export const AddedGroupAdminSchema = z.object({ groupAdminId: z.number().int() });
export type AddedGroupAdmin = z.infer<typeof AddedGroupAdminSchema>;

export const AddGroupAdminFormSchema = z.object({
  personId: z.number().int().positive(),
  function: z.string().max(64).nullable(),
  sinceOn: z.iso.date(),
});
export type AddGroupAdminForm = z.infer<typeof AddGroupAdminFormSchema>;

export const EndGroupAdminFormSchema = z.object({
  groupAdminId: z.number().int().positive(),
  endedOn: z.iso.date(),
});
export type EndGroupAdminForm = z.infer<typeof EndGroupAdminFormSchema>;
