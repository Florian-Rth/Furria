import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

export const GROUP_NAME_MAX_LENGTH = 80;
export const GROUP_DESCRIPTION_MAX_LENGTH = 400;

export const ManagedGroupsSearchSchema = z.object({
  group: z.coerce.number().int().positive().optional().catch(undefined),
});
export type ManagedGroupsSearch = z.infer<typeof ManagedGroupsSearchSchema>;

export const ManagedGroupSummarySchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  archivedOn: z.iso.date().nullable(),
  memberCount: z.number().int(),
  admins: z.array(PersonRefSchema),
});
export type ManagedGroupSummary = z.infer<typeof ManagedGroupSummarySchema>;

export const ManagedGroupsResponseSchema = z.object({
  groups: z.array(ManagedGroupSummarySchema),
});
export type ManagedGroupsResponse = z.infer<typeof ManagedGroupsResponseSchema>;

export const ManagedMemberSchema = PersonRefSchema.extend({
  groupMembershipId: z.number().int(),
  joinedOn: z.iso.date(),
  leftOn: z.iso.date().nullable(),
  since: z.iso.date(),
});
export type ManagedMember = z.infer<typeof ManagedMemberSchema>;

export const ManagedAdminSchema = PersonRefSchema.extend({
  groupAdminId: z.number().int(),
  function: z.string().nullable(),
  sinceOn: z.iso.date(),
  untilOn: z.iso.date().nullable(),
  since: z.iso.date(),
});
export type ManagedAdmin = z.infer<typeof ManagedAdminSchema>;

export const ManagedGroupDetailsSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  archivedOn: z.iso.date().nullable(),
  members: z.array(ManagedMemberSchema),
  admins: z.array(ManagedAdminSchema),
  pastMembers: z.array(ManagedMemberSchema),
  pastAdmins: z.array(ManagedAdminSchema),
});
export type ManagedGroupDetails = z.infer<typeof ManagedGroupDetailsSchema>;

export const CreatedGroupSchema = z.object({ groupId: z.number().int() });
export type CreatedGroup = z.infer<typeof CreatedGroupSchema>;

export const GroupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Die Gruppe braucht einen Namen.')
    .max(GROUP_NAME_MAX_LENGTH, `Höchstens ${GROUP_NAME_MAX_LENGTH} Zeichen.`),
  description: z
    .string()
    .max(GROUP_DESCRIPTION_MAX_LENGTH, `Höchstens ${GROUP_DESCRIPTION_MAX_LENGTH} Zeichen.`),
  isRecruiting: z.boolean(),
});
export type GroupForm = z.infer<typeof GroupFormSchema>;
