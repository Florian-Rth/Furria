import { z } from 'zod';
import { GroupDetailAdminSchema, GroupDetailMemberSchema } from '@/features/group-detail';
import { AppSearchSchema } from '@/features/session';
import { PersonRefSchema } from '@/lib/api/schemas';
import { GroupToneSchema } from '@/lib/group-tone';

export const GROUP_NAME_MAX_LENGTH = 80;
export const GROUP_DESCRIPTION_MAX_LENGTH = 400;
export const GROUP_KIND_NAME_MAX_LENGTH = 80;

const KIND_NAME_REQUIRED_MESSAGE = 'Gib der Gruppenart einen Namen.';
const KIND_NAME_TOO_LONG_MESSAGE = `Höchstens ${GROUP_KIND_NAME_MAX_LENGTH} Zeichen.`;

export const ManagedGroupsSearchSchema = AppSearchSchema.extend({
  work: z.string().optional().catch(undefined),
});
export type ManagedGroupsSearch = z.infer<typeof ManagedGroupsSearchSchema>;

export const ManagedGroupSummarySchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  groupKindId: z.number().int().nullable(),
  groupKindName: z.string().nullable(),
  tone: GroupToneSchema.nullable().default(null),
  archivedOn: z.iso.date().nullable(),
  memberCount: z.number().int(),
  admins: z.array(PersonRefSchema),
});
export type ManagedGroupSummary = z.infer<typeof ManagedGroupSummarySchema>;

export const ManagedGroupKindSchema = z.object({
  groupKindId: z.number().int(),
  name: z.string(),
  archivedOn: z.iso.date().nullable(),
  groupCount: z.number().int(),
});
export type ManagedGroupKind = z.infer<typeof ManagedGroupKindSchema>;

export const ManagedGroupsResponseSchema = z.object({
  groups: z.array(ManagedGroupSummarySchema),
  kinds: z.array(ManagedGroupKindSchema),
});
export type ManagedGroupsResponse = z.infer<typeof ManagedGroupsResponseSchema>;

export const ManagedGroupDetailsSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  archivedOn: z.iso.date().nullable(),
  members: z.array(GroupDetailMemberSchema),
  admins: z.array(GroupDetailAdminSchema),
  pastMembers: z.array(GroupDetailMemberSchema),
  pastAdmins: z.array(GroupDetailAdminSchema),
});
export type ManagedGroupDetails = z.infer<typeof ManagedGroupDetailsSchema>;

export const CreatedGroupSchema = z.object({ groupId: z.number().int() });
export type CreatedGroup = z.infer<typeof CreatedGroupSchema>;

export const CreatedGroupKindSchema = z.object({ groupKindId: z.number().int() });
export type CreatedGroupKind = z.infer<typeof CreatedGroupKindSchema>;

export const GroupKindFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, KIND_NAME_REQUIRED_MESSAGE)
    .max(GROUP_KIND_NAME_MAX_LENGTH, KIND_NAME_TOO_LONG_MESSAGE),
});
export type GroupKindForm = z.infer<typeof GroupKindFormSchema>;

export const GroupFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Die Gruppe braucht einen Namen.')
    .max(GROUP_NAME_MAX_LENGTH, `Höchstens ${GROUP_NAME_MAX_LENGTH} Zeichen.`),
  groupKindId: z.string(),
});
export type GroupForm = z.infer<typeof GroupFormSchema>;
