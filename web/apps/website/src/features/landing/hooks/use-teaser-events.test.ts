import { describe, expect, it } from 'vitest';
import { buildCancelledEvent, SEEDED_EVENTS } from '@/lib/seed/events';
import { selectTeaserEvents, TEASER_EVENT_COUNT } from './use-teaser-events';

const cancelledFirstEvening = buildCancelledEvent({
  id: 'ordensfest-2027',
  title: 'Ordensfest',
  type: 'Ordensfest',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-09T19:11',
  doorsOpenAt: null,
  teaser: 'Ein abgesagter Abend.',
  description: null,
  performers: null,
  ageHint: null,
  priceCents: null,
  capacity: null,
  presaleStartsAt: null,
  presaleEndsAt: null,
  freeCount: null,
});

describe('selectTeaserEvents', () => {
  it('picks the three earliest evenings in chronological order', () => {
    const shuffled = [...SEEDED_EVENTS].reverse();

    const teaser = selectTeaserEvents(shuffled);

    expect(teaser).toHaveLength(TEASER_EVENT_COUNT);
    expect(teaser.map((event) => event.title)).toEqual([
      '1. Prunksitzung',
      '2. Prunksitzung',
      'Weiberfasching',
    ]);
  });

  it('never teases a cancelled evening, however early it lies', () => {
    const teaser = selectTeaserEvents([cancelledFirstEvening, ...SEEDED_EVENTS]);

    expect(teaser.map((event) => event.title)).not.toContain('Ordensfest');
  });

  it('leaves the given list untouched', () => {
    const events = [...SEEDED_EVENTS].reverse();
    const order = events.map((event) => event.id);

    selectTeaserEvents(events);

    expect(events.map((event) => event.id)).toEqual(order);
  });

  it('returns fewer evenings when fewer exist', () => {
    expect(selectTeaserEvents(SEEDED_EVENTS.slice(0, 1))).toHaveLength(1);
    expect(selectTeaserEvents([])).toEqual([]);
  });
});
