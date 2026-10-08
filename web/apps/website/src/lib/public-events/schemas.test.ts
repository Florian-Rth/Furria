import { describe, expect, it } from 'vitest';
import { EventSchema, toParagraphs } from './schemas';

describe('toParagraphs', () => {
  it.each([
    [null, null],
    ['  \n\n ', null],
    ['Erster.\n\nZweiter.', ['Erster.', 'Zweiter.']],
    ['Erster.\n  \n\nZweiter.\nNoch zweiter.', ['Erster.', 'Zweiter.\nNoch zweiter.']],
  ])('splits %j into its paragraphs', (text, paragraphs) => {
    expect(toParagraphs(text)).toEqual(paragraphs);
  });
});

describe('EventSchema', () => {
  it('reads the instants of an event as Berlin wall-clock times', () => {
    const event = EventSchema.parse({
      eventId: 12,
      title: '1. Prunksitzung',
      startsAt: '2027-01-23T18:11:00+00:00',
      endsAt: '2027-01-23T23:30:00+00:00',
      doorsOpenAt: '2027-01-23T17:11:00+00:00',
      venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
      teaser: 'Ein voller Abend.',
      ageHint: null,
      priceCents: 1400,
      presaleStartsAt: '2026-11-11T10:11:00+00:00',
      status: 'fewLeft',
    });

    expect([event.startsAt, event.endsAt, event.doorsOpenAt, event.presaleStartsAt]).toEqual([
      '2027-01-23T19:11',
      '2027-01-24T00:30',
      '2027-01-23T18:11',
      '2026-11-11T11:11',
    ]);
  });
});
