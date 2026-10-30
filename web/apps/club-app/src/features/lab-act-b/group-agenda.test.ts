import { describe, expect, it } from 'vitest';
import type { GroupAct, MyAct } from '@/features/acts/schemas';
import { groupAgendaActsOf, groupStripFactsOf, soonestActIdOf } from './group-agenda';

const NOW = Date.parse('2026-10-30T10:00:00+01:00');

const groupAct = (actId: number, viewerInCast: boolean): GroupAct => ({
  actId,
  name: `Act ${actId}`,
  kind: 'dance',
  sessionYear: 2026,
  closed: false,
  viewerInCast,
});

const myAct = (actId: number, eveningAt: string | null): MyAct => ({
  actId,
  name: `Act ${actId}`,
  kind: 'dance',
  sessionYear: 2026,
  group: null,
  viewerInCast: true,
  viewerLeads: false,
  playable: true,
  cast: [],
  editors: [],
  nextEvening:
    eveningAt === null
      ? null
      : {
          eventId: actId,
          title: 'Abend',
          startsAt: eveningAt,
          position: null,
          stageStartsAt: null,
        },
  nextTraining: null,
});

describe('groupAgendaActsOf', () => {
  it('lists her acts first and dims the ones she is not part of', () => {
    const entries = groupAgendaActsOf(
      [groupAct(1, false), groupAct(2, true), groupAct(3, true)],
      [myAct(2, '2026-11-11T19:00:00+01:00'), myAct(3, null)],
      NOW,
    );

    expect(
      entries.map((entry) => [entry.act.actId, entry.dimmed, entry.next?.key ?? null]),
    ).toEqual([
      [2, false, 'evening-2'],
      [3, false, null],
      [1, true, null],
    ]);
  });
});

describe('soonestActIdOf', () => {
  it('picks the act whose next item comes first', () => {
    const entries = groupAgendaActsOf(
      [groupAct(1, true), groupAct(2, true)],
      [myAct(1, '2026-11-11T19:00:00+01:00'), myAct(2, '2026-11-02T19:00:00+01:00')],
      NOW,
    );

    expect(soonestActIdOf(entries)).toBe(2);
  });
});

describe('groupStripFactsOf', () => {
  it.each([
    ['Tanzgarde', 'Tanzgarde', ['a'], ['a']],
    ['Tanzgarde', 'Garde', ['a'], ['Garde', 'a']],
    ['Tanzgarde', null, ['a'], ['a']],
  ])('%s with kind %s', (name, kind, facts, expected) => {
    expect(groupStripFactsOf(name, kind, facts)).toEqual(expected);
  });
});
