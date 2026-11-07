import { describe, expect, it } from 'vitest';
import type { MyAct, StudioTraining } from '@/features/acts/schemas';
import type { ActKind } from '@/features/running-order/schemas';
import {
  answerKeyOf,
  askOf,
  doorsOf,
  eveningSlotOf,
  hubBandOf,
  isOwed,
  musicClockOf,
  tallyOf,
  templateOf,
  trainingTallyOf,
  upcomingTrainingsOf,
} from './act-card-model';

const person = (personId: number, firstName: string) => ({
  personId,
  firstName,
  lastName: 'X',
  portrait: null,
});

const training = (calendarEntryId: number, startsAt: string): StudioTraining => ({
  calendarEntryId,
  title: 'Training',
  startsAt,
  openSpotIds: [],
  responses: [
    { personId: 1, answer: 'yes', isRecordedOnBehalf: false, recordedBy: null, trail: [] },
    { personId: 2, answer: 'no', isRecordedOnBehalf: false, recordedBy: null, trail: [] },
    { personId: 3, answer: 'yes', isRecordedOnBehalf: false, recordedBy: null, trail: [] },
  ],
});

describe('templateOf', () => {
  it.each<[ActKind | null, string]>([
    ['dance', 'studio'],
    ['show', 'studio'],
    ['speech', 'spoken'],
    ['music', 'spoken'],
    ['point', 'point'],
    [null, 'studio'],
  ])('picks the template for %s', (kind, template) => {
    expect(templateOf(kind)).toBe(template);
  });
});

describe('doorsOf', () => {
  it.each([
    ['studio', true, 4],
    ['point', true, 1],
    ['studio', false, 1],
  ] as const)('gives a %s act seen with studio %s %i doors', (template, hasStudio, count) => {
    expect(doorsOf(template, hasStudio)).toHaveLength(count);
  });
});

describe('eveningSlotOf', () => {
  it('numbers a placed appearance from one', () => {
    expect(eveningSlotOf(3)).toEqual({ kind: 'placed', number: 4 });
  });

  it('tells an unplaced appearance from an evening without the act', () => {
    expect(eveningSlotOf(null)).toEqual({ kind: 'unplaced' });
    expect(eveningSlotOf(undefined)).toEqual({ kind: 'absent' });
  });
});

describe('upcomingTrainingsOf', () => {
  it('keeps a running training, drops older ones and sorts by start', () => {
    const now = Date.parse('2026-10-30T16:00:00+00:00');
    const result = upcomingTrainingsOf(
      [
        training(3, '2026-11-06T15:30:00+00:00'),
        training(1, '2026-10-23T15:30:00+00:00'),
        training(2, '2026-10-30T15:30:00+00:00'),
      ],
      now,
    );

    expect(result.map((entry) => entry.calendarEntryId)).toEqual([2, 3]);
  });
});

describe('answers', () => {
  it.each([
    ['yes', 'yes'],
    ['no', 'no'],
    ['maybe', null],
    [null, null],
  ] as const)('maps %s to a key', (answer, key) => {
    expect(answerKeyOf(answer)).toBe(key);
  });

  it.each([
    [true, null, true],
    [true, 'yes', false],
    [false, null, false],
  ] as const)('owes an answer when in cast %s with %s', (inCast, answer, owed) => {
    expect(isOwed(inCast, answer)).toBe(owed);
  });
});

describe('tallies', () => {
  it('knows no tally before the first answer', () => {
    expect(tallyOf(0, 0, 10)).toBeNull();
    expect(tallyOf(3, 1, 10)).toEqual({ present: 3, absent: 1, of: 10 });
  });

  it('counts the responses of a training', () => {
    expect(trainingTallyOf(training(1, '2026-11-03T18:00:00+00:00'), 10)).toEqual({
      present: 2,
      absent: 1,
      of: 10,
    });
  });
});

describe('askOf', () => {
  it('names the other editors', () => {
    expect(askOf([person(1, 'Thomas'), person(2, 'Florian')], 9)).toEqual({
      kind: 'names',
      names: ['Thomas', 'Florian'],
    });
  });

  it('turns to the viewer when she is the only editor', () => {
    expect(askOf([person(9, 'Sabine')], 9)).toEqual({ kind: 'self' });
  });

  it('says nobody when the act has no editors', () => {
    expect(askOf([], 9)).toEqual({ kind: 'nobody' });
  });
});

describe('musicClockOf', () => {
  it.each([
    [178.3374, '2:58'],
    [91.86, '1:32'],
    [59.6, '1:00'],
  ])('formats %s seconds', (seconds, clock) => {
    expect(musicClockOf(seconds)).toBe(clock);
  });
});

describe('hubBandOf', () => {
  it('reads the three facts of an act', () => {
    const act: MyAct = {
      actId: 3,
      name: 'Marschtanz',
      kind: 'dance',
      sessionYear: 2026,
      group: null,
      viewerInCast: true,
      viewerLeads: false,
      playable: true,
      cast: [],
      editors: [],
      nextEvening: {
        eventId: 17,
        title: 'Sessionseröffnung',
        startsAt: '2026-11-11T10:11:00+00:00',
        position: null,
      },
      nextTraining: {
        calendarEntryId: 46,
        title: 'Training',
        startsAt: '2026-11-03T18:00:00+00:00',
        viewerAnswer: 'no',
        present: 0,
        absent: 1,
      },
    };

    expect(hubBandOf(act)).toEqual({
      evening: { kind: 'unplaced' },
      eveningStartsAt: '2026-11-11T10:11:00+00:00',
      training: { startsAt: '2026-11-03T18:00:00+00:00', answer: 'no' },
      playable: true,
    });
  });
});
