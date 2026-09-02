import { describe, expect, it } from 'vitest';
import * as clubGroupsContent from '@/features/club/groups-content';
import * as exchangeContent from '@/features/events/exchange-content';
import * as eventsFaqContent from '@/features/events/faq-content';
import * as orderConfirmationContent from '@/features/events/order-confirmation-content';
import * as orderFlowContent from '@/features/events/order-flow-content';
import { deriveOrderFlowNotice } from '@/features/events/order-flow-display';
import * as orderSummaryContent from '@/features/events/order-summary-content';
import { EMPTY_ORDER_BUYER, OrderBuyerFormSchema } from '@/features/events/schemas';
import {
  deriveTicketPanelFace,
  deriveTicketPanelNote,
} from '@/features/events/ticket-panel-display';
import * as applyContent from '@/features/membership/apply-content';
import * as closingContent from '@/features/membership/closing-content';
import * as contactContent from '@/features/membership/contact-content';
import * as membershipFaqContent from '@/features/membership/faq-content';
import * as joinContent from '@/features/membership/join-content';
import * as stepsContent from '@/features/membership/steps-content';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';

const UNDECIDED_SALE_MECHANICS =
  /Saalplan|Sitzplan|\bSitzplätze?\b|\bPlätze\b|Sitzreihe|Reihe \d|reserviert|Warteliste|Stehplätz|Gruppenbestellung|Rollstuhl|PayPal|Kreditkarte|Lastschrift|Abendkasse|Apple Pay|Google Pay|Wallet|\bQR\b|\bscan|\bPDF\b|Ausdruck|Kalender|Erinnerung|\blive\b/i;

const PLATZ_LANGUAGE = /Platzwahl|Platz wählen/i;

const UNDECIDED_MEMBERSHIP_FRAMING =
  /Vorstand|passiv|vorbeikommen|vorbeischauen|ohne Anmeldung|Turnschuhe|Instagram|\bSMS\b/i;

const REJECTED_EXCHANGE_SPECIFICS =
  /Zweitmarkt|Weiterverkauf|Resale|\bSMS\b|Vorkaufsrecht|\d+\s*Stunden|\bQR\b|\blive\b|(?<!Karten)börse/i;

const GROUP_THE_CLUB_DOES_NOT_HAVE = /Spielmannszug/i;

const KARTEN_COPY = {
  'order-flow-content': orderFlowContent,
  'order-confirmation-content': orderConfirmationContent,
  'order-summary-content': orderSummaryContent,
  'exchange-content (band)': { exchangeBandContent: exchangeContent.exchangeBandContent },
  'events/faq-content': eventsFaqContent,
};

const MITGLIEDSCHAFT_COPY = {
  'apply-content': applyContent,
  'closing-content': closingContent,
  'contact-content': contactContent,
  'membership/faq-content': membershipFaqContent,
  'join-content': joinContent,
  'steps-content': stepsContent,
};

const GRUPPEN_COPY = {
  'groups-content': clubGroupsContent,
};

const copyOf = (modules: Record<string, object>): [string, string][] =>
  Object.entries(modules).map(([name, module]) => [name, JSON.stringify(module)]);

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  description: null,
  performers: null,
  ageHint: null,
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 18,
};

const midPresale = new Date('2026-12-01T12:00');

const withFacts = (overrides: Partial<EventFacts>): Event =>
  buildEvent({ ...baseFacts, ...overrides }, midPresale);

const everyLifecycleEvent: Event[] = [
  withFacts({}),
  withFacts({ presaleStartsAt: null, priceCents: null, capacity: null, freeCount: null }),
  withFacts({ presaleStartsAt: '2027-01-10T10:00', freeCount: null }),
  withFacts({ freeCount: 0 }),
  withFacts({ presaleEndsAt: '2026-11-30T23:59' }),
  buildCancelledEvent(baseFacts),
];

const derivedKartenCopy = (): string[] => [
  ...everyLifecycleEvent.map((event) => deriveOrderFlowNotice(event)?.body ?? ''),
  ...everyLifecycleEvent.map((event) => deriveTicketPanelNote(deriveTicketPanelFace(event)) ?? ''),
];

const rejectionMessages = (): string[] => {
  const result = OrderBuyerFormSchema.safeParse(EMPTY_ORDER_BUYER);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('the Karten copy', () => {
  it.each(copyOf(KARTEN_COPY))('claims no undecided sale mechanic in %s', (_name, copy) => {
    expect(copy).not.toMatch(UNDECIDED_SALE_MECHANICS);
    expect(copy).not.toMatch(PLATZ_LANGUAGE);
  });

  it('claims no undecided sale mechanic in the copy it derives per lifecycle state', () => {
    for (const copy of derivedKartenCopy()) {
      expect(copy).not.toMatch(UNDECIDED_SALE_MECHANICS);
      expect(copy).not.toMatch(PLATZ_LANGUAGE);
    }
  });

  it('claims no undecided sale mechanic when it turns a buyer form down', () => {
    const messages = rejectionMessages();

    expect(messages.length).toBeGreaterThan(0);
    for (const message of messages) {
      expect(message).not.toMatch(UNDECIDED_SALE_MECHANICS);
      expect(message).not.toMatch(PLATZ_LANGUAGE);
    }
  });
});

describe('the Kartenbörse concept copy', () => {
  it('frames its plans without any rejected mechanic or banned market term', () => {
    expect(JSON.stringify(exchangeContent)).not.toMatch(REJECTED_EXCHANGE_SPECIFICS);
  });
});

describe('the Mitgliedschaft copy', () => {
  it.each(copyOf(MITGLIEDSCHAFT_COPY))(
    'frames no undecided Mitgliedschaft fact in %s',
    (_name, copy) => {
      expect(copy).not.toMatch(UNDECIDED_MEMBERSHIP_FRAMING);
    },
  );
});

describe('the Gruppen copy', () => {
  it.each(copyOf(GRUPPEN_COPY))('names no Gruppe the club does not have in %s', (_name, copy) => {
    expect(copy).not.toMatch(GROUP_THE_CLUB_DOES_NOT_HAVE);
  });
});
