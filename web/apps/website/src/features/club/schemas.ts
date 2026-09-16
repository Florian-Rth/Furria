import { z } from 'zod';

export const PublicGroupSchema = z.object({
  groupId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  isRecruiting: z.boolean(),
});

export type PublicGroup = z.infer<typeof PublicGroupSchema>;

export const PublicGroupsResponseSchema = z.object({
  groups: z.array(PublicGroupSchema),
});

export type PublicGroupsResponse = z.infer<typeof PublicGroupsResponseSchema>;
