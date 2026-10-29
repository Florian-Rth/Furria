import { describe, expect, it } from 'vitest';
import {
  presalePlaceChoicesOf,
  toEventFormValues,
  toEventPayload,
  toEventVenueOptions,
  togglePresaleVenue,
} from './event-form';
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
  presalePlaces: [],
  cancelledAt: null,
  status: 'presaleScheduled',
  isOver: false,
  picture: null,
  publishedAt: null,
  createdAt: at(2026, 10, 1, 10),
  detailsMissing: ['description', 'picture', 'published'],
  review: { publishedAlbums: 0, publishedNews: 0 },
  steps: [],
  currentStep: null,
  ...overrides,
});

const form = (overrides: Partial<EventForm>): EventForm => ({
  title: ' 1. Prunksitzung ',
  startDay: '2027-01-16',
  startTime: '19:15',
  doorsOpenAt: '',
  venueId: '2',
  teaser: ' Der Abend der Session. ',
  description: '  ',
  ageHint: '',
  price: '',
  presaleDay: '',
  presaleTime: '10:00',
  presaleVenueIds: [],
  ...overrides,
});

describe('toEventPayload', () => {
  it('leaves every optional fact unset when the form leaves it empty', () => {
    expect(toEventPayload(form({}))).toEqual({
      title: '1. Prunksitzung',
      startsAt: at(2027, 1, 16, 19, 15),
      doorsOpenAt: null,
      venueId: 2,
      teaser: 'Der Abend der Session.',
      description: null,
      ageHint: null,
      priceCents: null,
      presaleStartsAt: null,
      presaleVenueIds: [],
    });
  });

  it('carries the doors, the price and the presale start', () => {
    const payload = toEventPayload(
      form({
        doorsOpenAt: '18:00',
        price: '22,50',
        presaleDay: '2026-12-01',
        presaleTime: '10:00',
        ageHint: ' ab 16 ',
      }),
    );

    expect(payload.doorsOpenAt).toBe('18:00:00');
    expect(payload.priceCents).toBe(2_250);
    expect(payload.presaleStartsAt).toBe(at(2026, 12, 1, 10));
    expect(payload.ageHint).toBe('ab 16');
  });

  it('keeps the presale places in the order they were picked', () => {
    expect(toEventPayload(form({ presaleVenueIds: [7, 2, 5] })).presaleVenueIds).toEqual([7, 2, 5]);
  });
});

describe('toEventFormValues', () => {
  it('reads an event back into the form it was written with', () => {
    const values = toEventFormValues(event({}), new Date(2026, 9, 7));

    expect(values).toMatchObject({
      startDay: '2027-01-16',
      startTime: '19:11',
      doorsOpenAt: '18:00',
      venueId: '2',
      price: '22,50',
      presaleDay: '2026-12-01',
      presaleTime: '10:00',
    });
  });

  it('reads the presale places back in their order', () => {
    const values = toEventFormValues(
      event({
        presalePlaces: [
          { venueId: 5, name: 'Bäckerei Schmitz', isArchived: false },
          { venueId: 2, name: 'Bürgerhaus', isArchived: true },
        ],
      }),
      new Date(2026, 9, 7),
    );

    expect(values.presaleVenueIds).toEqual([5, 2]);
  });

  it('starts a new event today, without venue, doors or presale', () => {
    const values = toEventFormValues(null, new Date(2026, 9, 7));

    expect(values).toMatchObject({
      startDay: '2026-10-07',
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

describe('togglePresaleVenue', () => {
  it.each([
    { name: 'adds a place at the end', picked: [5, 2], venueId: 7, expected: [5, 2, 7] },
    { name: 'removes a picked place', picked: [5, 2, 7], venueId: 2, expected: [5, 7] },
    { name: 'starts the list', picked: [], venueId: 3, expected: [3] },
  ])('$name', ({ picked, venueId, expected }) => {
    expect(togglePresaleVenue(picked, venueId)).toEqual(expected);
  });
});

describe('presalePlaceChoicesOf', () => {
  const venues = [
    { venueId: 2, name: 'Bürgerhaus' },
    { venueId: 5, name: 'Bäckerei Schmitz' },
  ];

  it('numbers the running places in pick order', () => {
    const choices = presalePlaceChoicesOf(venues, [], [5, 2]);

    expect(choices.map(({ venueId, position }) => ({ venueId, position }))).toEqual([
      { venueId: 2, position: 2 },
      { venueId: 5, position: 1 },
    ]);
  });

  it('keeps a picked archived place, marked, until it is removed', () => {
    const held = [
      { venueId: 9, name: 'Alte Sparkasse', isArchived: true },
      { venueId: 2, name: 'Bürgerhaus', isArchived: false },
    ];

    expect(
      presalePlaceChoicesOf(venues, held, [9]).map(({ venueId, position, isArchived }) => ({
        venueId,
        position,
        isArchived,
      })),
    ).toEqual([
      { venueId: 2, position: null, isArchived: false },
      { venueId: 5, position: null, isArchived: false },
      { venueId: 9, position: 1, isArchived: true },
    ]);
    expect(presalePlaceChoicesOf(venues, held, []).map((choice) => choice.venueId)).toEqual([2, 5]);
  });
});
