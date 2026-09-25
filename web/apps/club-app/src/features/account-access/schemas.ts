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

export const PersonAccessSchema = z.object({
  state: AccountStateSchema,
  reason: AccessBlockSchema.nullable(),
  invitation: LiveInvitationSchema.nullable(),
  history: z.array(AccountEventSchema),
});
export type PersonAccess = z.infer<typeof PersonAccessSchema>;

export const IssuedInvitationSchema = z.object({ expiresAt: z.iso.datetime({ offset: true }) });
export type IssuedInvitation = z.infer<typeof IssuedInvitationSchema>;
