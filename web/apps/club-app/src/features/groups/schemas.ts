import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

export const GroupSummarySchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  memberCount: z.number().int(),
  memberPreview: z.array(PersonRefSchema),
  admins: z.array(PersonRefSchema),
});
export type GroupSummary = z.infer<typeof GroupSummarySchema>;

export const GroupsResponseSchema = z.object({ groups: z.array(GroupSummarySchema) });
export type GroupsResponse = z.infer<typeof GroupsResponseSchema>;

export const GroupMemberSchema = PersonRefSchema.extend({
  since: z.iso.date(),
  isAffiliated: z.boolean(),
});
export type GroupMember = z.infer<typeof GroupMemberSchema>;

export const GroupAdminSchema = PersonRefSchema.extend({
  function: z.string().nullable(),
  since: z.iso.date(),
  isAffiliated: z.boolean(),
});
export type GroupAdmin = z.infer<typeof GroupAdminSchema>;

export const GroupDetailsSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  members: z.array(GroupMemberSchema),
  admins: z.array(GroupAdminSchema),
});
export type GroupDetails = z.infer<typeof GroupDetailsSchema>;
