import { describe, expect, it } from 'vitest';
import { toEventFormValues, toEventPayload, toEventVenueOptions } from './event-form';
import type { EventDetails, EventForm } from './schemas';

const at = (year: number, month: number, day: number, hour: number, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

const event = (overrides: Partial<EventDetails>): EventDetails => ({
  eventId: 4,
  title: '1. Prunksitzung',
  startsAt: at(2027, 1, 16, 19, 11),
  endsAt: at(2027, 1, 17, 1, 30),
  doorsOpenAt: '18:00',
  venueId: 2,
  venueName: 'Bürgerhaus',
  teaser: 'Der Abend der Session.',
  description: null,
  ageHint: null,
  priceCents: 2_250,
  presaleStartsAt: at(2026, 12, 1, 10),
  ticketAvailability: 'available',
  cancelledAt: null,
  status: 'presaleScheduled',
  isOver: false,
  ...overrides,
});

const form = (overrides: Partial<EventForm>): EventForm => ({
  title: ' 1. Prunksitzung ',
  startDay: '2027-01-16',
  startTime: '19:15',
  endDay: '',
  endTime: '23:30',
  doorsOpenAt: '',
  venueId: '2',
  teaser: ' Der Abend der Session. ',
  description: '  ',
  ageHint: '',
  price: '',
  presaleDay: '',
  presaleTime: '10:00',
  ...overrides,
});

describe('toEventPayload', () => {
  it('leaves every optional fact unset when the form leaves it empty', () => {
    expect(toEventPayload(form({}))).toEqual({
      title: '1. Prunksitzung',
      startsAt: at(2027, 1, 16, 19, 15),
      endsAt: null,
      doorsOpenAt: null,
      venueId: 2,
      teaser: 'Der Abend der Session.',
      description: null,
      ageHint: null,
      priceCents: null,
      presaleStartsAt: null,
    });
  });

  it('carries an end past midnight, the doors, the price and the presale start', () => {
    const payload = toEventPayload(
      form({
        endDay: '2027-01-17',
        endTime: '01:30',
        doorsOpenAt: '18:00',
        price: '22,50',
        presaleDay: '2026-12-01',
        presaleTime: '10:00',
        ageHint: ' ab 16 ',
      }),
    );

    expect(payload.endsAt).toBe(at(2027, 1, 17, 1, 30));
    expect(payload.doorsOpenAt).toBe('18:00:00');
    expect(payload.priceCents).toBe(2_250);
    expect(payload.presaleStartsAt).toBe(at(2026, 12, 1, 10));
    expect(payload.ageHint).toBe('ab 16');
  });
});

describe('toEventFormValues', () => {
  it('reads an event back into the form it was written with', () => {
    const values = toEventFormValues(event({}), new Date(2026, 9, 7));

    expect(values).toMatchObject({
      startDay: '2027-01-16',
      startTime: '19:11',
      endDay: '2027-01-17',
      endTime: '01:30',
      doorsOpenAt: '18:00',
      venueId: '2',
      price: '22,50',
      presaleDay: '2026-12-01',
      presaleTime: '10:00',
    });
  });

  it('starts a new event today, without venue, end, doors or presale', () => {
    const values = toEventFormValues(null, new Date(2026, 9, 7));

    expect(values).toMatchObject({
      startDay: '2026-10-07',
      endDay: '',
      doorsOpenAt: '',
      venueId: '',
      presaleDay: '',
    });
  });
});

describe('toEventVenueOptions', () => {
  const venues = [{ venueId: 2, name: 'Bürgerhaus' }];

  it('offers the running venues', () => {
    expect(toEventVenueOptions(venues, event({})).map((option) => option.value)).toEqual(['2']);
  });

  it('keeps the archived venue an event still holds', () => {
    const options = toEventVenueOptions(venues, event({ venueId: 9, venueName: 'Alte Halle' }));

    expect(options.map((option) => option.value)).toEqual(['2', '9']);
  });
});
