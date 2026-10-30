import { describe, expect, it } from 'vitest';
import type { MyAct, StudioTraining } from '@/features/acts/schemas';
import type { ActKind } from '@/features/running-order/schemas';
import {
  answerKeyOf,
  askOf,
  doorReachOf,
  doorsOf,
  eveningSlotOf,
  hubBandOf,
  isOwed,
  musicClockOf,
  namesPreviewOf,
  paneDoorOf,
  sideDoorOf,
  tallyOf,
  templateOf,
  trainingTallyOf,
  upcomingTrainingsOf,
} from './act-c-model';

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
  it('gives the studio four doors, speech three and a point one', () => {
    expect(doorsOf('studio')).toEqual(['evening', 'training', 'practice', 'cast']);
    expect(doorsOf('spoken')).toEqual(['evening', 'cast', 'text']);
    expect(doorsOf('point')).toEqual(['evening']);
  });
});

describe('doorReachOf', () => {
  it.each([
    ['studio', 'tile'],
    ['spoken', 'tile'],
    ['point', 'full'],
  ] as const)('lets %s tiles reach %s', (template, reach) => {
    expect(doorReachOf(template)).toBe(reach);
  });
});

describe('eveningSlotOf', () => {
  it('numbers a placed appearance from one', () => {
    expect(eveningSlotOf(3, '2026-11-11T10:45:00+00:00')).toEqual({
      kind: 'placed',
      number: 4,
      stagePosition: 3,
      stageStartsAt: '2026-11-11T10:45:00+00:00',
    });
  });

  it('tells an unplaced appearance from an evening without the act', () => {
    expect(eveningSlotOf(null, null)).toEqual({ kind: 'unplaced' });
    expect(eveningSlotOf(undefined, null)).toEqual({ kind: 'absent' });
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

describe('namesPreviewOf', () => {
  it('shows the first names and counts the rest', () => {
    expect(namesPreviewOf([person(1, 'Lena'), person(2, 'Jana'), person(3, 'Sophie')], 2)).toEqual({
      names: ['Lena', 'Jana'],
      more: 1,
    });
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

describe('pane doors', () => {
  const doors = ['evening', 'training', 'practice', 'cast'] as const;

  it('shows the opened door, else the first door with a sheet', () => {
    expect(paneDoorOf('cast', doors)).toBe('cast');
    expect(paneDoorOf(null, doors)).toBe('evening');
    expect(paneDoorOf('practice', doors)).toBe('evening');
  });

  it('puts the next door with a sheet beside it', () => {
    expect(sideDoorOf('evening', doors)).toBe('training');
    expect(sideDoorOf('training', doors)).toBe('evening');
    expect(sideDoorOf('evening', ['evening'])).toBeNull();
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
        stageStartsAt: null,
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
