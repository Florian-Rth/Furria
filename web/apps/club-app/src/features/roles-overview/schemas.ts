import { z } from 'zod';

export const RoleOverviewHolderSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  sinceOn: z.iso.date(),
});
export type RoleOverviewHolder = z.infer<typeof RoleOverviewHolderSchema>;

export const RoleOverviewSchema = z.object({
  roleId: z.number().int(),
  name: z.string(),
  description: z.string(),
  holders: z.array(RoleOverviewHolderSchema),
});
export type RoleOverview = z.infer<typeof RoleOverviewSchema>;

export const RolesOverviewResponseSchema = z.object({
  roles: z.array(RoleOverviewSchema),
});
export type RolesOverviewResponse = z.infer<typeof RolesOverviewResponseSchema>;
