import { z } from 'zod';

export const PromoMemberSchema = z.object({
  accountId: z.int(),
  firstName: z.string(),
  lastInitial: z.string(),
  arrivedAt: z.iso.datetime({ offset: true }).nullable(),
});
export type PromoMember = z.infer<typeof PromoMemberSchema>;

export const PromoMembersResponseSchema = z.object({
  members: z.array(PromoMemberSchema),
});
export type PromoMembersResponse = z.infer<typeof PromoMembersResponseSchema>;
