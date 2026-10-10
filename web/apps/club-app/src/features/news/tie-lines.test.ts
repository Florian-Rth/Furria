import { describe, expect, it } from 'vitest';
import { eventTieLinesOf } from './tie-lines';

const TODAY = new Date(2026, 9, 10, 10, 0);

describe('eventTieLinesOf', () => {
  it.each([
    {
      name: 'this year, with venue',
      startsAt: new Date(2026, 10, 11, 11, 11).toISOString(),
      venueName: 'Festhalle',
      isCancelled: false,
      line: 'Mi., 11.11. · 11:11 Uhr · Festhalle',
    },
    {
      name: 'next year, cancelled, no venue',
      startsAt: new Date(2027, 0, 23, 18, 11).toISOString(),
      venueName: null,
      isCancelled: true,
      line: 'Sa., 23.01.2027 · 18:11 Uhr · abgesagt',
    },
  ])(
    'lists weekday, date, time and only the facts that apply: $name',
    ({ startsAt, venueName, isCancelled, line }) => {
      const lines = eventTieLinesOf(
        { eventId: 1, title: 'Abend', startsAt, endsAt: null, venueName, isCancelled },
        'abgesagt',
        TODAY,
      );

      expect(lines.line).toBe(line);
    },
  );

  it('shows the day and the short month apart', () => {
    const lines = eventTieLinesOf(
      {
        eventId: 1,
        title: 'Abend',
        startsAt: new Date(2027, 0, 23, 18, 11).toISOString(),
        endsAt: null,
        venueName: null,
        isCancelled: false,
      },
      'abgesagt',
      TODAY,
    );

    expect([lines.day, lines.month]).toEqual(['23', 'JAN']);
  });
});
