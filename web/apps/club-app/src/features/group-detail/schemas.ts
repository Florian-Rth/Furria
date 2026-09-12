import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

export const GroupDetailMemberSchema = PersonRefSchema.extend({
  groupMembershipId: z.number().int(),
  joinedOn: z.iso.date(),
  leftOn: z.iso.date().nullable(),
  since: z.iso.date(),
});
export type GroupDetailMember = z.infer<typeof GroupDetailMemberSchema>;

export const GroupDetailAdminSchema = PersonRefSchema.extend({
  groupAdminId: z.number().int(),
  function: z.string().nullable(),
  sinceOn: z.iso.date(),
  untilOn: z.iso.date().nullable(),
  since: z.iso.date(),
});
export type GroupDetailAdmin = z.infer<typeof GroupDetailAdminSchema>;

export interface GroupDetailPerson {
  personId: number;
  firstName: string;
  lastName: string;
  since: string;
}

export interface GroupDetailFunctionary extends GroupDetailPerson {
  function: string | null;
}
