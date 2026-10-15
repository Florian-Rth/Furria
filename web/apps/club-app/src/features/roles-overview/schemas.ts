import { z } from 'zod';
import { HonoursSchema } from '@/lib/api/schemas';
import { ClubIconSchema } from '@/lib/club-icon';
import { GroupToneSchema } from '@/lib/group-tone';

export const RoleOverviewHolderSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  sinceOn: z.iso.date(),
  honours: HonoursSchema,
});
export type RoleOverviewHolder = z.infer<typeof RoleOverviewHolderSchema>;

export const RoleOverviewSchema = z.object({
  roleId: z.number().int(),
  name: z.string(),
  description: z.string(),
  coin: z.object({ icon: ClubIconSchema, tone: GroupToneSchema }).nullable(),
  holders: z.array(RoleOverviewHolderSchema),
});
export type RoleOverview = z.infer<typeof RoleOverviewSchema>;

export const RolesOverviewResponseSchema = z.object({
  roles: z.array(RoleOverviewSchema),
});
export type RolesOverviewResponse = z.infer<typeof RolesOverviewResponseSchema>;
