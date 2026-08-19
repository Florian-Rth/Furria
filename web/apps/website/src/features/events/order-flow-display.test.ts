import { describe, expect, it } from 'vitest';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';
import { EMBARGOED_MECHANICS } from '@/test/embargo';
import {
  buildOrderFlowDocumentTitle,
  deriveOrderFlowAction,
  deriveOrderFlowAvailabilityLabel,
  deriveOrderFlowBackLabel,
  deriveOrderFlowCapacity,
  deriveOrderFlowHeadline,
  deriveOrderFlowKicker,
  deriveOrderFlowNotice,
  deriveOrderFlowPriceLine,
  deriveOrderFlowStepSummary,
} from './order-flow-display';

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
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 18,
};

const midPresale = new Date('2026-12-01T12:00');

const onSale = buildEvent(baseFacts, midPresale);

const withoutPrice = buildEvent({ ...baseFacts, priceCents: null }, midPresale);

describe('buildOrderFlowDocumentTitle', () => {
  it('names the Karten of the evening, never a Platzwahl', () => {
    expect(buildOrderFlowDocumentTitle(onSale)).toBe('Karten für 1. Prunksitzung 2026/27');
  });
});

describe('deriveOrderFlowAction', () => {
  it('walks from the Kartenwahl into the buyer step', () => {
    expect(deriveOrderFlowAction(1, false)).toEqual({
      kind: 'step',
      label: 'Weiter zum Kauf →',
      step: 2,
    });
  });

  it('submits the buyer form instead of stepping past it', () => {
    expect(deriveOrderFlowAction(2, false)).toEqual({
      kind: 'submit',
      label: 'Weiter zur Zahlung →',
    });
  });

  it('waits on the payment build instead of linking to a Bestellung that cannot exist', () => {
    expect(deriveOrderFlowAction(3, true)).toEqual({
      kind: 'pending',
      label: 'Zur Bestätigung →',
    });
  });

  it('sends a deep link without buyer data back to the buyer step', () => {
    expect(deriveOrderFlowAction(3, false)).toEqual({
      kind: 'step',
      label: 'Zu deinen Daten →',
      step: 2,
    });
  });
});

describe('deriveOrderFlowStepSummary', () => {
  it('names the current step and how many there are', () => {
    expect(deriveOrderFlowStepSummary(1)).toBe('Schritt 1 von 3 · Kartenwahl');
    expect(deriveOrderFlowStepSummary(2)).toBe('Schritt 2 von 3 · Deine Daten');
    expect(deriveOrderFlowStepSummary(3)).toBe('Schritt 3 von 3 · Zahlung');
  });
});

describe('deriveOrderFlowPriceLine', () => {
  it('prices a Karte when the evening has a price', () => {
    expect(deriveOrderFlowPriceLine(onSale)).toBe('14 € pro Karte');
  });

  it('stays silent when the evening has no price', () => {
    expect(deriveOrderFlowPriceLine(withoutPrice)).toBeNull();
  });
});

const notScarce = buildEvent({ ...baseFacts, freeCount: 120 }, midPresale);

const scarceWithoutFreeCount: Event = { ...onSale, freeCount: null };

const announced = buildEvent({ ...baseFacts, freeCount: null, presaleStartsAt: null }, midPresale);

const presaleScheduled = buildEvent(
  { ...baseFacts, freeCount: null, presaleStartsAt: '2027-01-10T10:00' },
  midPresale,
);

const soldOut = buildEvent({ ...baseFacts, freeCount: 0 }, midPresale);

const salesClosed = buildEvent({ ...baseFacts, presaleEndsAt: '2026-11-20T18:00' }, midPresale);

const cancelled = buildCancelledEvent(baseFacts);

describe('deriveOrderFlowBackLabel', () => {
  it('points back to the evening by name', () => {
    expect(deriveOrderFlowBackLabel(onSale)).toBe('← 1. Prunksitzung');
  });
});

describe('deriveOrderFlowKicker', () => {
  it('states the step, the day, the time and the venue', () => {
    expect(deriveOrderFlowKicker(onSale, 'Kartenwahl')).toBe(
      'KARTENWAHL · SA., 23. JANUAR · 19:11 UHR · DORFGEMEINDEHAUS GROSSFURRA',
    );
  });

  it('carries whichever lead the page is in', () => {
    expect(deriveOrderFlowKicker(soldOut, 'KARTEN')).toBe(
      'KARTEN · SA., 23. JANUAR · 19:11 UHR · DORFGEMEINDEHAUS GROSSFURRA',
    );
  });
});

describe('deriveOrderFlowHeadline', () => {
  it('offers the Karten of the evening while the sale runs', () => {
    expect(deriveOrderFlowHeadline(notScarce)).toBe('KARTEN FÜR DIESEN ABEND.');
  });

  it('counts the last Karten down when they run short', () => {
    expect(deriveOrderFlowHeadline(onSale)).toBe('DIE LETZTEN 18 KARTEN.');
  });

  it('invents no count when the scarce evening reports none', () => {
    expect(deriveOrderFlowHeadline(scarceWithoutFreeCount)).toBe('KARTEN FÜR DIESEN ABEND.');
  });

  it('says out loud why every blocked state cannot sell', () => {
    expect(deriveOrderFlowHeadline(announced)).toBe('DER VORVERKAUF WIRD NOCH ANGEKÜNDIGT.');
    expect(deriveOrderFlowHeadline(presaleScheduled)).toBe(
      'DER VORVERKAUF HAT NOCH NICHT BEGONNEN.',
    );
    expect(deriveOrderFlowHeadline(soldOut)).toBe('DIESER ABEND IST AUSVERKAUFT.');
    expect(deriveOrderFlowHeadline(salesClosed)).toBe('DER VORVERKAUF IST BEENDET.');
    expect(deriveOrderFlowHeadline(cancelled)).toBe('DIESER ABEND FÄLLT AUS.');
  });
});

describe('deriveOrderFlowAvailabilityLabel', () => {
  it('prices a Karte and counts what is left', () => {
    expect(deriveOrderFlowAvailabilityLabel(onSale)).toBe('14 € pro Karte · 18 von 260 frei');
  });

  it('drops the price when the evening has none', () => {
    expect(deriveOrderFlowAvailabilityLabel(withoutPrice)).toBe('18 von 260 frei');
  });

  it('counts nothing it does not know', () => {
    expect(deriveOrderFlowAvailabilityLabel(scarceWithoutFreeCount)).toBe(
      '14 € pro Karte · Vorverkauf läuft',
    );
  });
});

describe('deriveOrderFlowCapacity', () => {
  it('narrows both counts of a running sale', () => {
    expect(deriveOrderFlowCapacity(onSale)).toEqual({ freeCount: 18, capacity: 260 });
  });

  it('stays silent when the evening reports no free count', () => {
    expect(deriveOrderFlowCapacity(scarceWithoutFreeCount)).toBeNull();
  });

  it('stays silent before and after the sale', () => {
    expect(deriveOrderFlowCapacity(presaleScheduled)).toBeNull();
    expect(deriveOrderFlowCapacity(salesClosed)).toBeNull();
  });
});

describe('deriveOrderFlowNotice', () => {
  it('lets a running sale through to the Kartenwahl', () => {
    expect(deriveOrderFlowNotice(onSale)).toBeNull();
    expect(deriveOrderFlowNotice(notScarce)).toBeNull();
  });

  it('sends an unannounced evening back to its page', () => {
    expect(deriveOrderFlowNotice(announced)).toEqual({
      body: 'Der Vorverkauf wird noch angekündigt. Sobald der Termin steht, findest du ihn auf der Seite des Abends.',
      cta: { label: 'Zum Abend →', to: '/events/prunksitzung-1-2027', emphasis: 'contained' },
    });
  });

  it('names the presale date an evening is still waiting for', () => {
    expect(deriveOrderFlowNotice(presaleScheduled)).toEqual({
      body: 'Der Vorverkauf startet am 10.01.2027 um 10:00 Uhr. Bis dahin lassen sich hier keine Karten bestellen.',
      cta: { label: 'Zum Abend →', to: '/events/prunksitzung-1-2027', emphasis: 'contained' },
    });
  });

  it('sends a sold-out evening to the Kartenbörse', () => {
    expect(deriveOrderFlowNotice(soldOut)).toEqual({
      body: 'Für diesen Abend sind alle Karten vergeben. Für ausverkaufte Abende planen wir eine Kartenbörse — wie sie genau funktioniert, arbeiten wir gerade sorgfältig aus.',
      cta: { label: 'Zur Kartenbörse →', to: '/events/exchange', emphasis: 'contained' },
    });
  });

  it('sends a closed and a cancelled evening back to its page', () => {
    expect(deriveOrderFlowNotice(salesClosed)).toEqual({
      body: 'Der Vorverkauf für diesen Abend ist beendet. Hier lassen sich keine Karten mehr bestellen.',
      cta: { label: 'Zum Abend →', to: '/events/prunksitzung-1-2027', emphasis: 'contained' },
    });
    expect(deriveOrderFlowNotice(cancelled)).toEqual({
      body: 'Dieser Abend fällt aus. Karten gibt es dafür keine.',
      cta: { label: 'Zum Abend →', to: '/events/prunksitzung-1-2027', emphasis: 'contained' },
    });
  });

  it('claims none of the mechanics the club has not decided yet', () => {
    for (const event of [announced, presaleScheduled, soldOut, salesClosed, cancelled]) {
      const notice = deriveOrderFlowNotice(event);
      if (notice === null) {
        throw new Error(`${event.id} left a blocked evening without a notice`);
      }
      expect(notice.body).not.toMatch(EMBARGOED_MECHANICS);
    }
  });
});
