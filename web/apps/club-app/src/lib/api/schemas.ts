import { z } from 'zod';
import { readApiBaseUrl } from '@/lib/runtime-config';
import { buildApiUrl } from './api-fetch';

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

export const MediaUrlSchema = z
  .string()
  .min(1)
  .transform((path) => buildApiUrl(readApiBaseUrl(), path));

export const PictureSchema = z.object({
  smallUrl: MediaUrlSchema,
  mediumUrl: MediaUrlSchema,
  largeUrl: MediaUrlSchema,
});
export type Picture = z.infer<typeof PictureSchema>;

export const PictureCropSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
});
export type PictureCrop = z.infer<typeof PictureCropSchema>;

export const MediaItemStateSchema = z.enum(['processing', 'ready', 'failed']);
export type MediaItemState = z.infer<typeof MediaItemStateSchema>;

export const PictureEditingSchema = z.object({
  state: MediaItemStateSchema,
  picture: PictureSchema.nullable(),
  uncroppedUrl: MediaUrlSchema.nullable(),
  crop: PictureCropSchema.nullable(),
});
export type PictureEditing = z.infer<typeof PictureEditingSchema>;

export const PersonRefSchema = z.object({
  personId: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
});
export type PersonRef = z.infer<typeof PersonRefSchema>;

export const PortraitPersonRefSchema = PersonRefSchema.extend({
  portrait: PictureSchema.nullable(),
});
export type PortraitPersonRef = z.infer<typeof PortraitPersonRefSchema>;

export const GroupRefSchema = z.object({ groupId: z.number().int(), name: z.string() });
export type GroupRef = z.infer<typeof GroupRefSchema>;

export const RoleRefSchema = z.object({ roleId: z.number().int(), name: z.string() });
export type RoleRef = z.infer<typeof RoleRefSchema>;

export const ContactChangeSchema = z.object({
  at: z.iso.datetime({ offset: true }),
  changedBy: PersonRefSchema.nullable(),
});
export type ContactChange = z.infer<typeof ContactChangeSchema>;

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
  contactChange: ContactChangeSchema.nullable(),
  portrait: PictureEditingSchema.nullable(),
});
export type MePerson = z.infer<typeof MePersonSchema>;

export const MeRelevantSessionSchema = z.object({ startYear: z.int(), ordinal: z.int() });
export type MeRelevantSession = z.infer<typeof MeRelevantSessionSchema>;

export const MeMembershipSchema = z.object({
  state: MembershipStateSchema,
  memberSince: z.iso.date().nullable(),
  currentStartedOn: z.iso.date().nullable(),
  currentEndedOn: z.iso.date().nullable(),
  relevantSession: MeRelevantSessionSchema.nullable(),
});
export type MeMembership = z.infer<typeof MeMembershipSchema>;

export const MePasskeySchema = z.object({
  id: z.string(),
  name: z.string(),
  addedAt: z.iso.datetime({ offset: true }),
});
export type MePasskey = z.infer<typeof MePasskeySchema>;

export const MeSchema = z.object({
  accountId: z.number().int(),
  email: z.string(),
  person: MePersonSchema.nullable(),
  membership: MeMembershipSchema,
  isAffiliated: z.boolean(),
  permissionKeys: z.array(z.string()),
  lastSeenAnnouncementAt: z.iso.datetime({ offset: true }).nullable(),
  appSince: z.iso.date().nullable(),
  passkeys: z.array(MePasskeySchema),
});
export type Me = z.infer<typeof MeSchema>;

export const PersonalMeSchema = MeSchema.extend({ person: MePersonSchema });
export type PersonalMe = z.infer<typeof PersonalMeSchema>;

export const PERMISSION_KEYS = {
  personsReadDetails: 'persons.read_details',
  personsManage: 'persons.manage',
  personsDelete: 'persons.delete',
  groupsManage: 'groups.manage',
  rolesManage: 'roles.manage',
  clubRead: 'club.read',
  announcementsPost: 'announcements.post',
  clubManage: 'club.manage',
  keyHoldingsManage: 'key_holdings.manage',
  boardManage: 'board.manage',
  calendarManageClub: 'calendar.manage_club',
  accountsManage: 'accounts.manage',
  membershipApplicationsDecide: 'membership_applications.decide',
  eventsManage: 'events.manage',
  ticketRequestsHandle: 'ticket_requests.handle',
  galleryUpload: 'gallery.upload',
  galleryManage: 'gallery.manage',
  galleryPublish: 'gallery.publish',
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/;
const CLOCK_TIME_LENGTH = 5;

export const ClockTimeSchema = z
  .string()
  .regex(CLOCK_TIME_PATTERN)
  .transform((value) => value.slice(0, CLOCK_TIME_LENGTH));
export type ClockTime = z.infer<typeof ClockTimeSchema>;
