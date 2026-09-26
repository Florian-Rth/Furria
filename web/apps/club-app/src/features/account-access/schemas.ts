import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

export const AccountStateSchema = z.enum(['noAccess', 'invited', 'active', 'disabled']);
export type AccountState = z.infer<typeof AccountStateSchema>;

export const AccessBlockSchema = z.enum(['notAffiliated', 'noBirthDate', 'underAge', 'noEmail']);
export type AccessBlock = z.infer<typeof AccessBlockSchema>;

export const InvitationChannelSchema = z.enum(['mail', 'inPerson', 'request']);
export type InvitationChannel = z.infer<typeof InvitationChannelSchema>;

export const AccountEventKindSchema = z.enum([
  'invited',
  'reminded',
  'redeemed',
  'recovered',
  'disabled',
  'enabled',
  'deleted',
  'loginEmailChanged',
  'recoveryIssued',
]);
export type AccountEventKind = z.infer<typeof AccountEventKindSchema>;

export const LiveInvitationSchema = z.object({
  channel: InvitationChannelSchema,
  issuedAt: z.iso.datetime({ offset: true }),
  issuedBy: PersonRefSchema.nullable(),
  expiresAt: z.iso.datetime({ offset: true }),
  isExpired: z.boolean(),
});
export type LiveInvitation = z.infer<typeof LiveInvitationSchema>;

export const AccountEventSchema = z.object({
  kind: AccountEventKindSchema,
  at: z.iso.datetime({ offset: true }),
  actor: PersonRefSchema.nullable(),
});
export type AccountEvent = z.infer<typeof AccountEventSchema>;

export const AccessRightsSchema = z.object({
  canInvite: z.boolean(),
  canManageAccount: z.boolean(),
});
export type AccessRights = z.infer<typeof AccessRightsSchema>;

export const PersonAccessSchema = z.object({
  state: AccountStateSchema,
  reason: AccessBlockSchema.nullable(),
  invitation: LiveInvitationSchema.nullable(),
  history: z.array(AccountEventSchema),
  rights: AccessRightsSchema,
  ageOfConsent: z.number().int(),
});
export type PersonAccess = z.infer<typeof PersonAccessSchema>;

export const IssuedInvitationSchema = z.object({ expiresAt: z.iso.datetime({ offset: true }) });
export type IssuedInvitation = z.infer<typeof IssuedInvitationSchema>;

export const InPersonInvitationSchema = z.object({
  link: z.url(),
  code: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type InPersonInvitation = z.infer<typeof InPersonInvitationSchema>;

export const AccessStateSchema = z.object({
  state: AccountStateSchema,
  isRecoveryOpen: z.boolean(),
});
export type AccessState = z.infer<typeof AccessStateSchema>;
