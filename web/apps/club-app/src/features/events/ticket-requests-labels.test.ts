import { describe, expect, it } from 'vitest';
import type { TicketRequest, TicketRequestsResponse } from './schemas';
import {
  groupTicketRequests,
  requestsOfEvent,
  toPhoneHref,
  toRequestsTally,
  toTicketUnitLabel,
  withTicketRequestToDoMark,
} from './ticket-requests-labels';

const request = (overrides: Partial<TicketRequest>): TicketRequest => ({
  ticketRequestId: 1,
  eventId: 12,
  eventTitle: '1. Prunksitzung',
  eventStartsAt: '2027-01-23T18:11:00+00:00',
  ticketCount: 4,
  name: 'Anna Muster',
  phone: '0171 1234567',
  email: 'anna@example.org',
  message: null,
  requestedAt: '2026-12-01T09:30:00+00:00',
  ...overrides,
});

describe('groupTicketRequests', () => {
  it('groups requests by their evening in the order they came', () => {
    const groups = groupTicketRequests([
      request({ ticketRequestId: 1, eventId: 12 }),
      request({ ticketRequestId: 2, eventId: 14, eventTitle: '2. Prunksitzung' }),
      request({ ticketRequestId: 3, eventId: 12 }),
    ]);

    expect(
      groups.map((group) => [group.eventId, group.requests.map((r) => r.ticketRequestId)]),
    ).toEqual([
      [12, [1, 3]],
      [14, [2]],
    ]);
  });
});

describe('requestsOfEvent', () => {
  it('keeps only the requests of one evening', () => {
    const requests = [
      request({ ticketRequestId: 1, eventId: 12 }),
      request({ ticketRequestId: 2, eventId: 14 }),
    ];

    expect(requestsOfEvent(requests, 14).map((r) => r.ticketRequestId)).toEqual([2]);
  });
});

describe('toRequestsTally', () => {
  it.each([
    [[request({ ticketCount: 1 })], '1 Anfrage · 1 Karte'],
    [[request({ ticketCount: 4 }), request({ ticketCount: 2 })], '2 Anfragen · 6 Karten'],
  ])('counts %j as %s', (requests, tally) => {
    expect(toRequestsTally(requests)).toBe(tally);
  });
});

describe('toTicketUnitLabel', () => {
  it.each([
    [1, 'Karte'],
    [3, 'Karten'],
  ])('names %i tickets %s', (count, unit) => {
    expect(toTicketUnitLabel(count)).toBe(unit);
  });
});

describe('toPhoneHref', () => {
  it.each([
    ['0171 1234567', 'tel:01711234567'],
    ['+49 (171) 123-45/67', 'tel:+491711234567'],
  ])('dials %s as %s', (phone, href) => {
    expect(toPhoneHref(phone)).toBe(href);
  });
});

describe('withTicketRequestToDoMark', () => {
  const mark = { kind: 'ticketRequestWaiting', version: 'v1', seen: true } as const;

  it('marks the to-do of loaded requests', () => {
    const current: TicketRequestsResponse = {
      ticketRequests: [],
      toDo: { kind: 'ticketRequestWaiting', count: 2, isSeen: false, newCount: 1, version: 'v1' },
    };

    expect(withTicketRequestToDoMark(current, mark)?.toDo).toEqual({
      kind: 'ticketRequestWaiting',
      count: 2,
      isSeen: true,
      newCount: 0,
      version: 'v1',
    });
  });

  it.each<[string, TicketRequestsResponse | undefined]>([
    ['unloaded requests', undefined],
    ['requests without a to-do', { ticketRequests: [], toDo: null }],
  ])('leaves %s as they are', (_label, current) => {
    expect(withTicketRequestToDoMark(current, mark)).toBe(current);
  });
});
