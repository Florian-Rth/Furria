import { describe, expect, it } from 'vitest';
import { toAttendanceRoll, toRollNames } from './calendar-attendance';

const answer = (
  personId: number,
  firstName: string,
  value: 'yes' | 'maybe' | 'no',
  recordedByFirstName: string | null = null,
) => ({
  personId,
  firstName,
  lastName: 'Muster',
  answer: value,
  recordedByFirstName,
  recordedByLastName: recordedByFirstName === null ? null : 'Garde',
  answeredAt: '2027-01-15T12:00:00+00:00',
});

describe('toAttendanceRoll', () => {
  it('groups the answers in the order yes, maybe, no', () => {
    const roll = toAttendanceRoll({
      isClosed: false,
      yes: 2,
      maybe: 0,
      no: 1,
      answers: [answer(1, 'Bea', 'yes'), answer(2, 'Dora', 'no'), answer(3, 'Mona', 'yes', 'Bea')],
      notAnswered: null,
    });

    expect(
      roll.groups.map((group) => [group.key, group.count, group.people.map((p) => p.personId)]),
    ).toEqual([
      ['yes', 2, [1, 3]],
      ['maybe', 0, []],
      ['no', 1, [2]],
    ]);
    expect(roll.answerCount).toBe(3);
  });

  it.each([
    { notAnswered: null, keys: ['yes', 'maybe', 'no'] },
    {
      notAnswered: [{ personId: 9, firstName: 'Kai', lastName: 'Kind' }],
      keys: ['yes', 'maybe', 'no', 'open'],
    },
  ])('adds the open group only when it is known: $keys', ({ notAnswered, keys }) => {
    const roll = toAttendanceRoll({
      isClosed: true,
      yes: 0,
      maybe: 0,
      no: 0,
      answers: [],
      notAnswered,
    });

    expect(roll.groups.map((group) => group.key)).toEqual(keys);
  });

  it('keeps the counts when the names are not sent', () => {
    const roll = toAttendanceRoll({
      isClosed: false,
      yes: 4,
      maybe: 1,
      no: 0,
      answers: null,
      notAnswered: null,
    });

    expect(roll.groups.map((group) => [group.count, group.people.length])).toEqual([
      [4, 0],
      [1, 0],
      [0, 0],
    ]);
  });
});

describe('toRollNames', () => {
  it.each([
    { people: [], expected: undefined },
    {
      people: [
        { personId: 1, name: 'Bea Garde', recordedBy: null },
        { personId: 2, name: 'Mona Muster', recordedBy: 'Bea' },
      ],
      expected: 'Bea Garde, Mona Muster (Bea)',
    },
  ])('joins $people.length names', ({ people, expected }) => {
    expect(toRollNames(people, (recordedBy) => `(${recordedBy})`)).toBe(expected);
  });
});
