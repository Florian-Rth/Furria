import type { PersonAccessFilter } from './person-access-filter';
import type { InvitationRoundPreview } from './schemas';

export type InvitationRoundKind = 'invite' | 'remind';

export type InvitationRoundEmphasis = 'lead' | 'aside';

export const INVITATION_ROUND_KINDS: readonly InvitationRoundKind[] = ['invite', 'remind'];

export const ROUND_EYEBROW = 'Zugänge';
export const ROUND_CANCEL_LABEL = 'Abbrechen';
export const ROUND_CLOSE_LABEL = 'Schließen';

export interface InvitationRoundAct {
  kind: InvitationRoundKind;
  count: number;
  canSend: boolean;
  actionLabel: string;
  blockedReason: string | null;
  statusLine: string;
  question: string;
  explanation: string;
  consequence: string;
  confirmLabel: string;
}

interface RoundCopy {
  actionLabel: string;
  blockedReason: string;
  waiting: (persons: string) => string;
  question: (persons: string) => string;
  explanation: string;
  consequence: (persons: string, verb: string) => string;
  confirmLabel: (persons: string) => string;
  sent: (persons: string) => string;
  sentNobody: string;
}

const ROUND_COPY: Record<InvitationRoundKind, RoundCopy> = {
  invite: {
    actionLabel: 'Alle einladen',
    blockedReason: 'Wer einen Zugang haben kann, ist schon eingeladen.',
    waiting: (persons) => `${persons} noch nie eingeladen`,
    question: (persons) => `Einladung an ${persons}`,
    explanation:
      'Wer einen Zugang haben kann und noch nie eingeladen wurde, bekommt eine Mail mit einem persönlichen Link. Der Link gilt 14 Tage.',
    consequence: (persons, verb) => `${persons} ${verb} jetzt eine Mail.`,
    confirmLabel: (persons) => `Einladung an ${persons} senden`,
    sent: (persons) => `Einladung an ${persons} ist unterwegs.`,
    sentNobody: 'Es war niemand mehr einzuladen.',
  },
  remind: {
    actionLabel: 'Erinnern',
    blockedReason: 'Keine offene Einladung ist älter als drei Tage.',
    waiting: (persons) => `${persons} seit über drei Tagen eingeladen`,
    question: (persons) => `Erinnerung an ${persons}`,
    explanation:
      'Wer seit mehr als drei Tagen eine offene Einladung hat, bekommt sie noch einmal mit neuem Link. Der bisherige Link gilt dann nicht mehr.',
    consequence: (persons, verb) => `${persons} ${verb} jetzt eine Erinnerung.`,
    confirmLabel: (persons) => `Erinnerung an ${persons} senden`,
    sent: (persons) => `Erinnerung an ${persons} ist unterwegs.`,
    sentNobody: 'Es war niemand mehr zu erinnern.',
  },
};

const toPersonCount = (count: number): string => (count === 1 ? '1 Person' : `${count} Personen`);

const toRoundCount = (kind: InvitationRoundKind, preview: InvitationRoundPreview): number =>
  kind === 'invite' ? preview.inviteCount : preview.remindCount;

const toReceives = (count: number): string => (count === 1 ? 'bekommt' : 'bekommen');

export const toInvitationRoundAct = (
  kind: InvitationRoundKind,
  preview: InvitationRoundPreview,
): InvitationRoundAct => {
  const copy = ROUND_COPY[kind];
  const count = toRoundCount(kind, preview);
  const persons = toPersonCount(count);
  const canSend = count > 0;

  return {
    kind,
    count,
    canSend,
    actionLabel: copy.actionLabel,
    blockedReason: canSend ? null : copy.blockedReason,
    statusLine: canSend ? copy.waiting(persons) : copy.blockedReason,
    question: copy.question(persons),
    explanation: copy.explanation,
    consequence: copy.consequence(persons, toReceives(count)),
    confirmLabel: copy.confirmLabel(persons),
  };
};

export const toRoundSentMessage = (kind: InvitationRoundKind, sentCount: number): string => {
  const copy = ROUND_COPY[kind];

  return sentCount === 0 ? copy.sentNobody : copy.sent(toPersonCount(sentCount));
};

export const toWithoutEmailFact = (count: number): string =>
  count === 0 ? 'bei allen hinterlegt' : `${toPersonCount(count)} – nur vor Ort`;

const ROUND_FILTERS: Record<InvitationRoundKind, PersonAccessFilter> = {
  invite: 'none',
  remind: 'invited',
};

const DEFAULT_LEAD_ROUND: InvitationRoundKind = 'invite';

export const toInvitationRoundEmphasis = (
  kind: InvitationRoundKind,
  filter: PersonAccessFilter | null,
): InvitationRoundEmphasis => {
  if (filter === null) {
    return kind === DEFAULT_LEAD_ROUND ? 'lead' : 'aside';
  }

  return ROUND_FILTERS[kind] === filter ? 'lead' : 'aside';
};
