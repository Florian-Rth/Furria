import { z } from 'zod';

export const PublicClubSessionSchema = z.object({
  startYear: z.number().int(),
  label: z.string().min(1),
  motto: z.string().nullable(),
});

export type PublicClubSession = z.infer<typeof PublicClubSessionSchema>;

export const PublicClubSchema = z.object({
  name: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  instagramUrl: z.string().nullable(),
  facebookUrl: z.string().nullable(),
  memberCount: z.number().int().nonnegative(),
  groupCount: z.number().int().nonnegative(),
  ageOfConsent: z.number().int().positive(),
  session: PublicClubSessionSchema,
});

export type PublicClub = z.infer<typeof PublicClubSchema>;
