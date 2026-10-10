import { z } from 'zod';
import { PictureSchema } from '@/lib/api/picture';

export const PublicBoardSeatSchema = z.object({
  officeName: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  portrait: PictureSchema.nullable(),
});

export type PublicBoardSeat = z.infer<typeof PublicBoardSeatSchema>;

export const PublicBoardResponseSchema = z.object({
  seats: z.array(PublicBoardSeatSchema),
});

export const ClubSearchSchema = z.object({
  group: z.coerce.number().int().positive().optional().catch(undefined),
});

export type ClubSearch = z.infer<typeof ClubSearchSchema>;
