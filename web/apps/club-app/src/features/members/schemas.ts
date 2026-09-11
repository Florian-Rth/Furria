import { z } from 'zod';
import { GroupRefSchema, MembershipStateSchema, RoleRefSchema } from '@/lib/api/schemas';

export const MemberSummarySchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  membershipState: MembershipStateSchema,
  groups: z.array(GroupRefSchema),
  roles: z.array(RoleRefSchema),
});
export type MemberSummary = z.infer<typeof MemberSummarySchema>;

export const MembersResponseSchema = z.object({ members: z.array(MemberSummarySchema) });
export type MembersResponse = z.infer<typeof MembersResponseSchema>;
