import { z } from 'zod';
import { PictureSchema, PortraitPersonRefSchema } from '@/lib/api/schemas';
import { GroupToneSchema } from '@/lib/group-tone';

export const GroupSummarySchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  picture: PictureSchema.nullable(),
  description: z.string(),
  isRecruiting: z.boolean(),
  groupKindName: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  tone: GroupToneSchema.nullable(),
  memberCount: z.number().int(),
  memberPreview: z.array(PortraitPersonRefSchema),
  admins: z.array(PortraitPersonRefSchema),
  viewerIsMember: z.boolean(),
  viewerIsAdmin: z.boolean(),
});
export type GroupSummary = z.infer<typeof GroupSummarySchema>;

export const GroupsResponseSchema = z.object({ groups: z.array(GroupSummarySchema) });
export type GroupsResponse = z.infer<typeof GroupsResponseSchema>;
