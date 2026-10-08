import { describe, expect, it } from 'vitest';
import * as clubGroupsContent from '@/features/club/groups-content';
import * as eventDetailContent from '@/features/events/event-detail-content';
import * as eventsFaqContent from '@/features/events/faq-content';
import { deriveTicketPanelNote } from '@/features/events/ticket-panel-display';
import * as applyContent from '@/features/membership/apply-content';
import {
  buildApplyThanksText,
  buildBelowAgeOfConsentMessage,
} from '@/features/membership/apply-content';
import * as closingContent from '@/features/membership/closing-content';
import * as confirmationContent from '@/features/membership/confirmation-content';
import * as contactContent from '@/features/membership/contact-content';
import * as membershipFaqContent from '@/features/membership/faq-content';
import { buildJoinFaq } from '@/features/membership/faq-content';
import * as joinContent from '@/features/membership/join-content';
import * as stepsContent from '@/features/membership/steps-content';

const UNDECIDED_SALE_MECHANICS =
  /Saalplan|Sitzplan|\bSitzplätze?\b|\bPlätze\b|Sitzreihe|Reihe \d|reserviert|Warteliste|Stehplätz|Gruppenbestellung|Rollstuhl|PayPal|Kreditkarte|Lastschrift|Abendkasse|Apple Pay|Google Pay|Wallet|\bQR\b|\bscan|\bPDF\b|Ausdruck|Kalender|Erinnerung|\blive\b/i;

const SEAT_SELECTION_LANGUAGE = /Platzwahl|Platz wählen/i;

const UNDECIDED_MEMBERSHIP_FRAMING =
  /Vorstand|passiv|vorbeikommen|vorbeischauen|ohne Anmeldung|Turnschuhe|Instagram|\bSMS\b/i;

const GROUP_THE_CLUB_DOES_NOT_HAVE = /Spielmannszug/i;

const TICKET_COPY = {
  'event-detail-content': eventDetailContent,
  'events/faq-content': eventsFaqContent,
};

const MEMBERSHIP_COPY = {
  'apply-content': applyContent,
  'closing-content': closingContent,
  'confirmation-content': confirmationContent,
  'contact-content': contactContent,
  'membership/faq-content': membershipFaqContent,
  'join-content': joinContent,
  'steps-content': stepsContent,
};

const GROUPS_COPY = {
  'groups-content': clubGroupsContent,
};

const derivedMembershipCopy = (): string[] => [
  ...[16, null].flatMap((ageOfConsent) => buildJoinFaq(ageOfConsent).map((entry) => entry.answer)),
  buildBelowAgeOfConsentMessage(16),
  buildApplyThanksText('lena.brandt@example.de'),
];

const copyOf = (modules: Record<string, object>): [string, string][] =>
  Object.entries(modules).map(([name, module]) => [name, JSON.stringify(module)]);

const derivedTicketCopy = (): string[] =>
  (
    [
      { kind: 'announced' },
      { kind: 'presale', presaleStartsAt: '2026-11-11T11:11' },
      { kind: 'tickets', scarce: true },
      { kind: 'soldOut' },
      { kind: 'cancelled' },
    ] as const
  ).map((face) => deriveTicketPanelNote(face) ?? '');

describe('the ticket copy', () => {
  it.each(copyOf(TICKET_COPY))('claims no undecided sale mechanic in %s', (_name, copy) => {
    expect(copy).not.toMatch(UNDECIDED_SALE_MECHANICS);
    expect(copy).not.toMatch(SEAT_SELECTION_LANGUAGE);
  });

  it('claims no undecided sale mechanic in the copy it derives per lifecycle state', () => {
    for (const copy of derivedTicketCopy()) {
      expect(copy).not.toMatch(UNDECIDED_SALE_MECHANICS);
      expect(copy).not.toMatch(SEAT_SELECTION_LANGUAGE);
    }
  });
});

describe('the membership copy', () => {
  it.each(copyOf(MEMBERSHIP_COPY))('frames no undecided membership fact in %s', (_name, copy) => {
    expect(copy).not.toMatch(UNDECIDED_MEMBERSHIP_FRAMING);
  });

  it('frames no undecided membership fact in the copy it derives from the club', () => {
    for (const copy of derivedMembershipCopy()) {
      expect(copy).not.toMatch(UNDECIDED_MEMBERSHIP_FRAMING);
    }
  });
});

describe('the groups copy', () => {
  it.each(copyOf(GROUPS_COPY))('names no group the club does not have in %s', (_name, copy) => {
    expect(copy).not.toMatch(GROUP_THE_CLUB_DOES_NOT_HAVE);
  });
});
