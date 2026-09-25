import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import type { MailInvitationAct } from './access-actions';
import type {
  AccessBlock,
  AccountEventKind,
  AccountState,
  InvitationChannel,
  LiveInvitation,
  PersonAccess,
} from './schemas';

export const ACCESS_SECTION_TITLE = 'Zugang';
export const ACCESS_STATE_LABEL = 'Status';
export const INVITATION_LABEL = 'Einladung';
export const HISTORY_TITLE = 'Verlauf';
export const INVITATION_CHAIN_TITLE = 'Bisherige Einladung';

const META_SEPARATOR = ' · ';

const ACCOUNT_STATE_CHIPS: Record<AccountState, StateChip> = {
  noAccess: { label: 'kein Zugang', tone: 'neutral', dot: false },
  invited: { label: 'eingeladen', tone: 'gold', dot: true },
  active: { label: 'aktiv', tone: 'green', dot: true },
  disabled: { label: 'gesperrt', tone: 'accent', dot: false },
};

export const toAccountStateChip = (state: AccountState): StateChip => ACCOUNT_STATE_CHIPS[state];

const ACCESS_BLOCK_LINES: Record<AccessBlock, (firstName: string) => string> = {
  notAffiliated: (firstName) =>
    `${firstName} ist nicht im Verein aktiv – ohne Mitgliedschaft, Gruppe oder Rolle gibt es keinen Zugang.`,
  noBirthDate: (firstName) =>
    `Für ${firstName} ist kein Geburtsdatum hinterlegt. Trag es in den Stammdaten ein.`,
  underAge: (firstName) => `${firstName} ist jünger als das Mindestalter für einen Zugang.`,
  noEmail: (firstName) =>
    `Für ${firstName} ist keine E-Mail-Adresse hinterlegt. Trag sie in den Stammdaten ein.`,
};

export const toAccessBlockLine = (reason: AccessBlock, firstName: string): string =>
  ACCESS_BLOCK_LINES[reason](firstName);

export const toNoMailInvitationLine = (access: PersonAccess, firstName: string): string => {
  if (access.reason !== null) {
    return toAccessBlockLine(access.reason, firstName);
  }
  if (access.state === 'active' || access.state === 'disabled') {
    return `${firstName} hat bereits einen Zugang.`;
  }

  return toAccessBlockLine('noEmail', firstName);
};

const ACCOUNT_EVENT_TITLES: Record<AccountEventKind, string> = {
  invited: 'Eingeladen',
  reminded: 'Erinnert',
  redeemed: 'Zugang eingerichtet',
  recovered: 'Zugang wiederhergestellt',
  disabled: 'Gesperrt',
  enabled: 'Entsperrt',
  deleted: 'Account gelöscht',
  loginEmailChanged: 'Anmelde-E-Mail geändert',
};

export const toAccountEventTitle = (kind: AccountEventKind): string => ACCOUNT_EVENT_TITLES[kind];

const INVITATION_CHANNEL_LABELS: Record<InvitationChannel, string> = {
  mail: 'per Mail',
  inPerson: 'vor Ort',
  request: 'selbst angefordert',
};

export const formatInstantDay = (at: string): string => formatIsoDay(toIsoDay(new Date(at)));

const toRefName = (person: PersonRef): string => `${person.firstName} ${person.lastName}`;

export const toActorMeta = (actor: PersonRef | null): string | undefined =>
  actor === null ? undefined : `von ${toRefName(actor)}`;

export const toInvitationSpan = (invitation: LiveInvitation): string => {
  const issued = `${INVITATION_CHANNEL_LABELS[invitation.channel]}${META_SEPARATOR}${formatInstantDay(invitation.issuedAt)}`;
  const issuer = toActorMeta(invitation.issuedBy);

  return issuer === undefined ? issued : `${issued} ${issuer}`;
};

export const toInvitationValidity = (invitation: LiveInvitation): string => {
  const expiresOn = formatInstantDay(invitation.expiresAt);

  return invitation.isExpired ? `abgelaufen am ${expiresOn}` : `gültig bis ${expiresOn}`;
};

export const MAIL_ACT_LABELS: Record<MailInvitationAct, string> = {
  invite: 'Per Mail einladen',
  reinvite: 'Erneut einladen',
};

export const MAIL_PILL_LABELS: Record<MailInvitationAct, string> = {
  invite: 'Einladen',
  reinvite: 'Erneut einladen',
};

export const MAIL_INVITATION_VALIDITY_NOTE = 'Der Link in der Mail gilt 14 Tage.';

export const toInvitationConsequence = (
  firstName: string,
  email: string,
  act: MailInvitationAct,
): string => {
  const mail = `${firstName} bekommt eine Mail an ${email}.`;

  return act === 'reinvite' ? `${mail} Die bisherige Einladung gilt dann nicht mehr.` : mail;
};

export const toInvitationSentMessage = (firstName: string): string =>
  `Einladung an ${firstName} ist unterwegs.`;

const ACCESS_LANDING_KIND = 'access';

export const toAccessLandingKey = (personId: number): string =>
  toLandingKey(ACCESS_LANDING_KIND, personId);
