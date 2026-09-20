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

export const MembershipStateSchema = z.enum(['none', 'ended', 'paused', 'active']);
export type MembershipState = z.infer<typeof MembershipStateSchema>;

export const PersonRefSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
});
export type PersonRef = z.infer<typeof PersonRefSchema>;

export const GroupRefSchema = z.object({ groupId: z.number().int(), name: z.string() });
export type GroupRef = z.infer<typeof GroupRefSchema>;

export const RoleRefSchema = z.object({ roleId: z.number().int(), name: z.string() });
export type RoleRef = z.infer<typeof RoleRefSchema>;

export const MePersonSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  street: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
  birthDate: z.iso.date().nullable(),
  contactVisibleToMembers: z.boolean(),
});
export type MePerson = z.infer<typeof MePersonSchema>;

export const MeMembershipSchema = z.object({
  state: MembershipStateSchema,
  memberSince: z.iso.date().nullable(),
  currentStartedOn: z.iso.date().nullable(),
  currentEndedOn: z.iso.date().nullable(),
});
export type MeMembership = z.infer<typeof MeMembershipSchema>;

export const MeSchema = z.object({
  accountId: z.number().int(),
  email: z.string(),
  person: MePersonSchema,
  membership: MeMembershipSchema,
  isAffiliated: z.boolean(),
  permissionKeys: z.array(z.string()),
});
export type Me = z.infer<typeof MeSchema>;

export const PERMISSION_KEYS = {
  personsReadDetails: 'persons.read_details',
  personsManage: 'persons.manage',
  groupsManage: 'groups.manage',
  rolesManage: 'roles.manage',
  clubRead: 'club.read',
  announcementsPost: 'announcements.post',
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];
