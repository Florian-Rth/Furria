import { GROUP_TONES } from '@furria/ui/group-tone';
import { z } from 'zod';

export const PublicGroupSchema = z.object({
  groupId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  isRecruiting: z.boolean(),
  groupKindName: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  tone: z.enum(GROUP_TONES).nullable(),
});

export type PublicGroup = z.infer<typeof PublicGroupSchema>;

export const PublicGroupsResponseSchema = z.object({
  groups: z.array(PublicGroupSchema),
});
