import { z } from 'zod';
import { PictureSchema } from '@/lib/api/schemas';
import { GroupToneSchema } from '@/lib/group-tone';

export const MentionedGroupSchema = z.object({
  groupId: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  tone: GroupToneSchema.nullable(),
  picture: PictureSchema.nullable(),
});
export type MentionedGroup = z.infer<typeof MentionedGroupSchema>;

export const MentionedPersonSchema = z.object({
  personId: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  officeName: z.string().min(1),
  portrait: PictureSchema.nullable(),
});
export type MentionedPerson = z.infer<typeof MentionedPersonSchema>;
