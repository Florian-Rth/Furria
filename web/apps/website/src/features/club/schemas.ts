import { z } from 'zod';

export const PublicBoardSeatSchema = z.object({
  officeName: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  portraitUrl: z.string().nullable(),
});

export type PublicBoardSeat = z.infer<typeof PublicBoardSeatSchema>;

export const PublicBoardResponseSchema = z.object({
  seats: z.array(PublicBoardSeatSchema),
});
