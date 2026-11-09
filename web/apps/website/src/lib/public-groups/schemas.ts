import { KK_TONE_PATTERN } from '@furria/ui/group-tone';
import { z } from 'zod';
import { PictureSchema } from '@/lib/api/schemas';

export const PublicGroupSchema = z.object({
  groupId: z.number().int().positive(),
  name: z.string().min(1),
  picture: PictureSchema.nullable(),
  description: z.string(),
  isRecruiting: z.boolean(),
  groupKindName: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  tone: z.string().regex(KK_TONE_PATTERN).nullable(),
});

export type PublicGroup = z.infer<typeof PublicGroupSchema>;

export const PublicGroupsResponseSchema = z.object({
  groups: z.array(PublicGroupSchema),
});
