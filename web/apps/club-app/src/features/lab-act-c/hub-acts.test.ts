import { describe, expect, it } from 'vitest';
import type { GroupAct, MyAct } from '@/features/acts/schemas';
import { hubActCardOf, hubActsOf } from './hub-acts';

const group = { groupId: 1, name: 'Tanzgarde', tone: null, icon: null, picture: null };

const myAct = (
  actId: number,
  groupId: number,
  viewerInCast: boolean,
  viewerAnswer: 'yes' | 'no' | null,
  playable: boolean,
): MyAct => ({
  actId,
  name: `Act ${actId}`,
  kind: 'dance',
  sessionYear: 2026,
  group: { ...group, groupId },
  viewerInCast,
  viewerLeads: !viewerInCast,
  playable,
  cast: [],
  editors: [],
  nextEvening: null,
  nextTraining: {
    calendarEntryId: 46,
    title: 'Training',
    startsAt: '2026-11-03T18:00:00+00:00',
    viewerAnswer,
    present: 0,
    absent: 0,
  },
});

const groupAct = (actId: number, sessionYear: number, closed: boolean): GroupAct => ({
  actId,
  name: `Act ${actId}`,
  kind: 'dance',
  sessionYear,
  closed,
  viewerInCast: false,
});

describe('hubActsOf', () => {
  it('splits her acts of this group from the other open acts of the session', () => {
    const result = hubActsOf(
      [myAct(3, 1, true, null, true), myAct(5, 2, false, null, true)],
      [
        groupAct(3, 2026, false),
        groupAct(4, 2026, false),
        groupAct(7, 2026, true),
        groupAct(8, 2025, false),
      ],
      1,
      2026,
    );

    expect(result.mine.map((act) => act.actId)).toEqual([3]);
    expect(result.others.map((act) => act.actId)).toEqual([4]);
  });
});

describe('hubActCardOf', () => {
  it.each([
    [true, null, true, 'attention'],
    [true, 'yes', false, 'positive'],
    [true, 'no', false, 'secondary'],
    [false, null, false, 'strong'],
  ] as const)('in cast %s answering %s owes %s with tone %s', (inCast, answer, owed, tone) => {
    const card = hubActCardOf(myAct(3, 1, inCast, answer, true));

    expect(card.owed).toBe(owed);
    expect(card.trainingTone).toBe(tone);
  });

  it('quiets the practise fact without music', () => {
    expect(hubActCardOf(myAct(6, 3, true, null, false)).practiceTone).toBe('secondary');
  });
});
