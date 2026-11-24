import type { StudioSpot } from '@furria/studio/studio-schemas';
import { describe, expect, it } from 'vitest';
import type { StudioAttendance, StudioTraining } from '@/features/acts/schemas';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import {
  attendanceTallyOf,
  castAttendanceOf,
  withMarkedResponse,
  withWithdrawnMark,
} from './training-attendance';

const person = (personId: number): CastPerson => ({
  personId,
  firstName: `Person ${personId}`,
  lastName: 'Garde',
  portrait: null,
  absent: false,
});

const response = (
  personId: number,
  answer: AttendanceAnswer,
  isRecordedOnBehalf = false,
  trail: StudioAttendance['trail'] = [],
): StudioAttendance => ({
  personId,
  answer,
  isRecordedOnBehalf,
  recordedBy: isRecordedOnBehalf ? 'Gerd Gardist' : null,
  trail,
});

const training = (responses: StudioAttendance[]): StudioTraining => ({
  calendarEntryId: 5,
  title: 'Training',
  startsAt: '2026-11-03T18:30:00+01:00',
  openSpotIds: [],
  responses,
});

describe('attendanceTallyOf', () => {
  it('counts everyone in the cast as there unless the answer is no, whoever gave it', () => {
    const cast = [person(1), person(2), person(3), person(4)];
    const answered = training([response(1, 'no'), response(2, 'maybe'), response(3, 'no', true)]);

    expect(attendanceTallyOf(castAttendanceOf(cast, answered))).toEqual({
      present: 2,
      expected: 4,
    });
  });
});

const spots: StudioSpot[] = [
  {
    spotId: 11,
    number: 1,
    person: { personId: 1, firstName: 'Anna', lastName: 'A', portrait: null },
  },
  {
    spotId: 12,
    number: 2,
    person: { personId: 2, firstName: 'Ben', lastName: 'B', portrait: null },
  },
];

const ownYesAt = {
  answer: 'yes' as const,
  isRecordedOnBehalf: false,
  recordedBy: null,
  recordedAt: '2026-11-01T10:00:00+01:00',
};

describe('withMarkedResponse', () => {
  it('replaces her response with the mark and opens her spot', () => {
    const marked = withMarkedResponse(
      training([response(1, 'yes', false, [ownYesAt]), response(2, 'maybe')]),
      spots,
      1,
      'no',
    );

    expect([
      marked.openSpotIds,
      marked.responses.map((entry) => [entry.personId, entry.answer, entry.trail.length]),
    ]).toEqual([
      [11],
      [
        [2, 'maybe', 0],
        [1, 'no', 2],
      ],
    ]);
  });
});

describe('withWithdrawnMark', () => {
  it.each([
    [
      'restores her own answer before the mark',
      response(1, 'no', true, [
        { ...ownYesAt, answer: 'no', isRecordedOnBehalf: true, recordedBy: 'Gerd Gardist' },
        ownYesAt,
      ]),
      [[1, 'yes', false]],
      [],
    ],
    [
      'forgets a mark that stood alone',
      response(1, 'no', true, [
        { ...ownYesAt, answer: 'no', isRecordedOnBehalf: true, recordedBy: 'Gerd Gardist' },
      ]),
      [],
      [],
    ],
  ])('%s', (_case, marked, responses, openSpotIds) => {
    const withdrawn = withWithdrawnMark(training([marked]), spots, 1);

    expect([
      withdrawn.responses.map((entry) => [entry.personId, entry.answer, entry.isRecordedOnBehalf]),
      withdrawn.openSpotIds,
    ]).toEqual([responses, openSpotIds]);
  });
});
