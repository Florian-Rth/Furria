import { GROUP_TONES } from '@furria/ui';
import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

export const GroupToneSchema = z.enum(GROUP_TONES);

export const GroupSummarySchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  description: z.string(),
  isRecruiting: z.boolean(),
  groupKindName: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  tone: GroupToneSchema.nullable(),
  memberCount: z.number().int(),
  memberPreview: z.array(PersonRefSchema),
  admins: z.array(PersonRefSchema),
  viewerIsMember: z.boolean(),
  viewerIsAdmin: z.boolean(),
});
export type GroupSummary = z.infer<typeof GroupSummarySchema>;

export const GroupsResponseSchema = z.object({ groups: z.array(GroupSummarySchema) });
export type GroupsResponse = z.infer<typeof GroupsResponseSchema>;
