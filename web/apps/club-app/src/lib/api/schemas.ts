import { z } from 'zod';

export const SessionTokensSchema = z.object({
  accessToken: z.string().min(1),
  accessTokenExpiresAt: z.iso.datetime({ offset: true }),
  refreshToken: z.string().min(1),
  refreshTokenExpiresAt: z.iso.datetime({ offset: true }),
});
export type SessionTokens = z.infer<typeof SessionTokensSchema>;

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const NoContentSchema = z.undefined();
export type NoContent = z.infer<typeof NoContentSchema>;

const MEMBERSHIP_TYPE_BY_CODE = { 1: 'active', 2: 'youth', 3: 'honorary' } as const;
const MEMBERSHIP_STATUS_BY_CODE = { 1: 'active', 2: 'paused', 3: 'left' } as const;

export const MembershipTypeSchema = z
  .union([z.literal(1), z.literal(2), z.literal(3)])
  .transform((code) => MEMBERSHIP_TYPE_BY_CODE[code]);
export type MembershipType = z.infer<typeof MembershipTypeSchema>;

export const MembershipStatusSchema = z
  .union([z.literal(1), z.literal(2), z.literal(3)])
  .transform((code) => MEMBERSHIP_STATUS_BY_CODE[code]);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

export const MembershipSchema = z.object({
  type: MembershipTypeSchema,
  status: MembershipStatusSchema,
  startedAt: z.iso.date(),
  endedAt: z.iso.date().nullable(),
});
export type Membership = z.infer<typeof MembershipSchema>;

export const PersonSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
});
export type Person = z.infer<typeof PersonSchema>;

export const MeSchema = z.object({
  accountId: z.number().int(),
  email: z.string(),
  person: PersonSchema,
  membership: MembershipSchema.nullable(),
});
export type Me = z.infer<typeof MeSchema>;
