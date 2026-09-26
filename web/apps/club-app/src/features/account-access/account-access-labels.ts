import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import type { StateChip } from '@/lib/state-chips';
import type { AccountLockAct, MailInvitationAct } from './access-actions';
import type {
  AccessBlock,
  AccountEventKind,
  AccountState,
  InvitationChannel,
  LiveInvitation,
  PersonAccess,
} from './schemas';
import type { InPersonPurpose } from './types';

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
  recoveryIssued: 'Wiederherstellung gestartet',
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

export const IN_PERSON_ACT_LABEL = 'Vor Ort zeigen';
export const RECOVERY_ACT_LABEL = 'Zugang wiederherstellen';
export const RECOVERY_ROW_META = 'Neues Passwort vor Ort, QR-Code und Code 15 Minuten gültig';
export const IN_PERSON_ROW_META = 'QR-Code und Code aufs Handy, 15 Minuten gültig';
export const IN_PERSON_INSTRUCTION =
  'Mit der Handykamera den QR-Code scannen – oder in der App auf „Code eingeben“ tippen und den Code eintippen.';
export const IN_PERSON_EXPIRED_LINE = 'Der Code ist abgelaufen und lässt sich nicht mehr nutzen.';
export const IN_PERSON_REISSUE_LABEL = 'Neuer Code';
export const IN_PERSON_RETRY_LABEL = 'Erneut versuchen';
export const IN_PERSON_FINISH_LABEL = 'Fertig';
export const IN_PERSON_VALIDITY_NOTE =
  'Der Code gilt 15 Minuten. Eine offene Einladung per Mail gilt dann nicht mehr.';
export const RECOVERY_VALIDITY_NOTE =
  'Der Code gilt 15 Minuten. Mit dem neuen Passwort werden alle anderen Geräte abgemeldet.';

export const IN_PERSON_TITLES: Record<InPersonPurpose, string> = {
  onboarding: IN_PERSON_ACT_LABEL,
  recovery: RECOVERY_ACT_LABEL,
};

export const IN_PERSON_VALIDITY_NOTES: Record<InPersonPurpose, string> = {
  onboarding: IN_PERSON_VALIDITY_NOTE,
  recovery: RECOVERY_VALIDITY_NOTE,
};

export const toInPersonHref = (personId: number): string =>
  `/manage/persons/${personId}/invitations/in-person`;

export const toRecoveryHref = (personId: number): string =>
  `/manage/persons/${personId}/access-recovery`;

export const toInPersonCountdownLine = (countdown: string): string => `Gültig noch ${countdown}`;

const IN_PERSON_QR_LABELS: Record<InPersonPurpose, (firstName: string) => string> = {
  onboarding: (firstName) => `QR-Code mit der Einladung für ${firstName}`,
  recovery: (firstName) => `QR-Code zum Wiederherstellen des Zugangs von ${firstName}`,
};

export const toInPersonQrLabel = (purpose: InPersonPurpose, firstName: string): string =>
  IN_PERSON_QR_LABELS[purpose](firstName);

export const toRedeemedTitle = (firstName: string): string => `${firstName.toUpperCase()} IST DRIN`;

const REDEEMED_LINES: Record<InPersonPurpose, (firstName: string) => string> = {
  onboarding: (firstName) => `Der Zugang ist eingerichtet und ${firstName} ist angemeldet.`,
  recovery: (firstName) =>
    `Das neue Passwort gilt und ${firstName} ist angemeldet. Alle anderen Geräte sind abgemeldet.`,
};

export const toRedeemedLine = (purpose: InPersonPurpose, firstName: string): string =>
  REDEEMED_LINES[purpose](firstName);

const ACCESS_LANDING_KIND = 'access';

export const toAccessLandingKey = (personId: number): string =>
  toLandingKey(ACCESS_LANDING_KIND, personId);

export const toVouchLine = (firstName: string, ageOfConsent: number): string =>
  `Du bestätigst, dass ${firstName} mindestens ${ageOfConsent} ist.`;

export const toVouchableBlockLine = (firstName: string): string =>
  `Für ${firstName} ist kein Geburtsdatum hinterlegt. Mit einer Einladung bürgst du für das Alter.`;

export const toAccessBlockNote = (
  access: PersonAccess,
  firstName: string,
  vouchesForAge: boolean,
): string | null => {
  if (access.reason === null) {
    return null;
  }

  return vouchesForAge
    ? toVouchableBlockLine(firstName)
    : toAccessBlockLine(access.reason, firstName);
};

export interface AccountLockCopy {
  actLabel: string;
  confirmLabel: string;
  eyebrow: string;
  explanation: string;
  tone: 'neutral' | 'danger';
  question: (firstName: string) => string;
  consequence: (firstName: string) => string;
  done: (firstName: string) => string;
}

export const ACCOUNT_LOCK_COPY: Record<AccountLockAct, AccountLockCopy> = {
  disable: {
    actLabel: 'Zugang sperren',
    confirmLabel: 'Sperren',
    eyebrow: 'Zugang sperren',
    explanation:
      'Der Zugang bleibt mit seinem Verlauf erhalten und lässt sich jederzeit entsperren.',
    tone: 'danger',
    question: (firstName) => `Zugang von ${firstName} sperren?`,
    consequence: (firstName) =>
      `${firstName} wird überall abgemeldet und kann sich nicht mehr anmelden.`,
    done: (firstName) => `Der Zugang von ${firstName} ist gesperrt.`,
  },
  enable: {
    actLabel: 'Zugang entsperren',
    confirmLabel: 'Entsperren',
    eyebrow: 'Zugang entsperren',
    explanation: 'Geräte, die beim Sperren abgemeldet wurden, bleiben abgemeldet.',
    tone: 'neutral',
    question: (firstName) => `Zugang von ${firstName} entsperren?`,
    consequence: (firstName) => `${firstName} kann sich wieder anmelden.`,
    done: (firstName) => `Der Zugang von ${firstName} ist entsperrt.`,
  },
};
