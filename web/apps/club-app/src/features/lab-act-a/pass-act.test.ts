import { describe, expect, it } from 'vitest';
import type { MyAct, StudioEvening, StudioTraining } from '@/features/acts/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import {
  canOpenDetails,
  castRoleOf,
  groupActsOf,
  laterEveningsOf,
  laterTrainingsOf,
  ownSpotOf,
  passActOf,
  passCastOf,
  passPracticeOf,
  passSlotOf,
  passTemplateOf,
  passTrainingOf,
  shownAnswerOf,
} from './pass-act';

const person = (personId: number, firstName: string): PortraitPersonRef => ({
  personId,
  firstName,
  lastName: 'X',
  portrait: null,
});

const myAct = (actId: number, overrides: Partial<MyAct>): MyAct => ({
  actId,
  name: `Act ${actId}`,
  kind: 'dance',
  sessionYear: 2026,
  group: { groupId: 1, name: 'Tanzgarde', tone: null, icon: null, picture: null },
  viewerInCast: true,
  viewerLeads: false,
  playable: true,
  cast: [],
  editors: [],
  nextEvening: null,
  nextTraining: null,
  ...overrides,
});

const evening = (
  eventId: number,
  startsAt: string,
  position: number | null | 'absent',
): StudioEvening => ({
  eventId,
  title: `Abend ${eventId}`,
  startsAt,
  appearance:
    position === 'absent'
      ? null
      : {
          appearanceId: eventId,
          position,
          stageStartsAt: null,
          added: [],
          removedPersonIds: [],
          spotChanges: [],
          choreography: null,
        },
});

const training = (
  calendarEntryId: number,
  startsAt: string,
  answers: readonly [number, 'yes' | 'no' | 'maybe'][],
): StudioTraining => ({
  calendarEntryId,
  title: 'Training',
  startsAt,
  openSpotIds: [],
  responses: answers.map(([personId, answer]) => ({
    personId,
    answer,
    isRecordedOnBehalf: false,
    recordedBy: null,
    trail: [],
  })),
});

describe('passTemplateOf', () => {
  it.each([
    ['dance', false, 'studio'],
    ['show', false, 'studio'],
    ['speech', true, 'spoken'],
    ['music', true, 'spoken'],
    ['point', true, 'point'],
    [null, true, 'studio'],
    [null, false, 'spoken'],
  ] as const)('%s playable=%s → %s', (kind, playable, expected) => {
    expect(passTemplateOf(kind, playable)).toBe(expected);
  });
});

describe('castRoleOf', () => {
  it.each([
    ['speech', 'speakers'],
    ['music', 'performers'],
    ['dance', 'cast'],
    [null, 'cast'],
  ] as const)('%s → %s', (kind, expected) => {
    expect(castRoleOf(kind)).toBe(expected);
  });
});

describe('passSlotOf', () => {
  it('has no slot without an evening', () => {
    expect(passSlotOf(null).kind).toBe('none');
  });

  it('is pending while the act is not placed', () => {
    const slot = passSlotOf({
      eventId: 7,
      title: 'Prunksitzung',
      startsAt: '2027-01-23T19:11:00+00:00',
      position: null,
      stageStartsAt: null,
    });

    expect(slot.kind).toBe('pending');
  });

  it('carries the position once placed', () => {
    const slot = passSlotOf({
      eventId: 7,
      title: 'Prunksitzung',
      startsAt: '2027-01-23T19:11:00+00:00',
      position: 3,
      stageStartsAt: '2027-01-23T19:45:00+00:00',
    });

    expect(slot).toMatchObject({ kind: 'placed', position: 3 });
  });
});

describe('passTrainingOf', () => {
  const next = {
    calendarEntryId: 46,
    title: 'Training',
    startsAt: '2026-11-03T18:00:00+00:00',
    viewerAnswer: null,
    present: 3,
    absent: 1,
  };

  it('has none without a training', () => {
    expect(passTrainingOf(null, true).kind).toBe('none');
  });

  it('shows the tally to a leader outside the cast', () => {
    expect(passTrainingOf(next, false)).toMatchObject({ kind: 'tally', present: 3, absent: 1 });
  });

  it.each([
    [null, true],
    ['maybe', true],
    ['yes', false],
    ['no', false],
  ] as const)('a cast member who answered %s owes an answer: %s', (answer, owed) => {
    expect(passTrainingOf({ ...next, viewerAnswer: answer }, true)).toMatchObject({
      kind: 'answer',
      owed,
    });
  });
});

describe('passPracticeOf', () => {
  it('hides practice outside the studio template', () => {
    expect(passPracticeOf('spoken', true, [], 1).kind).toBe('hidden');
  });

  it('opens practice when there is music', () => {
    expect(passPracticeOf('studio', true, [], 1).kind).toBe('open');
  });

  it('names the editors to ask, never the viewer herself', () => {
    const practice = passPracticeOf('studio', false, [person(1, 'Lena'), person(2, 'Sophie')], 1);

    expect(practice).toEqual({ kind: 'silent', askNames: ['Sophie'] });
  });
});

describe('passCastOf', () => {
  it('puts the viewer first and marks her', () => {
    const cast = passCastOf([person(1, 'Anna'), person(2, 'Lena'), person(3, 'Mia')], 2);

    expect(cast.map((member) => [member.person.personId, member.own])).toEqual([
      [2, true],
      [1, false],
      [3, false],
    ]);
  });
});

describe('canOpenDetails', () => {
  it.each([
    [{ viewerLeads: true, editors: [] }, false, true],
    [{ viewerLeads: false, editors: [person(5, 'Lena')] }, false, true],
    [{ viewerLeads: false, editors: [person(6, 'Sophie')] }, false, false],
    [{ viewerLeads: false, editors: [] }, true, true],
  ])('%o canEditStudio=%s → %s', (act, canEditStudio, expected) => {
    expect(canOpenDetails(act, 5, canEditStudio)).toBe(expected);
  });
});

describe('laterEveningsOf', () => {
  it('keeps only her appearances after the shown one, in date order', () => {
    const lines = laterEveningsOf(
      [
        evening(3, '2027-02-03T14:11:00+00:00', 4),
        evening(1, '2026-10-30T16:11:00+00:00', 4),
        evening(4, '2027-02-04T18:11:00+00:00', 'absent'),
        evening(2, '2026-11-11T10:11:00+00:00', null),
      ],
      1,
    );

    expect(lines.map((line) => [line.eventId, line.position])).toEqual([
      [2, null],
      [3, 4],
    ]);
  });
});

describe('laterTrainingsOf', () => {
  it('skips the shown training and reads her own answer', () => {
    const lines = laterTrainingsOf(
      [
        training(9, '2026-11-10T18:00:00+00:00', [[5, 'no']]),
        training(8, '2026-11-05T18:00:00+00:00', [[6, 'yes']]),
        training(7, '2026-11-03T18:00:00+00:00', []),
      ],
      7,
      5,
    );

    expect(lines.map((line) => [line.calendarEntryId, line.answer])).toEqual([
      [8, null],
      [9, 'no'],
    ]);
  });
});

describe('shownAnswerOf', () => {
  it.each([
    ['yes', null, false, 'yes'],
    ['yes', 'no', false, 'no'],
    ['yes', 'no', true, 'yes'],
    [null, null, false, null],
  ] as const)('saved %s chosen %s failed %s → %s', (saved, chosen, failed, expected) => {
    expect(shownAnswerOf(saved, chosen, failed)).toBe(expected);
  });
});

describe('ownSpotOf', () => {
  const spots = [
    { spotId: 1, number: 1, person: person(5, 'Lena') },
    { spotId: 2, number: 2, person: null },
  ];

  it.each([
    [5, 1],
    [6, null],
    [null, null],
  ])('viewer %s → spot %s', (viewerId, expected) => {
    expect(ownSpotOf(spots, viewerId)).toBe(expected);
  });
});

describe('passActOf', () => {
  it('prefers her own act summary', () => {
    const own = myAct(3, { name: 'Marschtanz' });

    expect(passActOf(3, [own], undefined, 5)?.name).toBe('Marschtanz');
  });

  it('has nothing while neither read is there', () => {
    expect(passActOf(3, [], undefined, 5)).toBeNull();
  });
});

describe('groupActsOf', () => {
  it('cards the acts she dances in or leads, rows the open rest', () => {
    const acts = groupActsOf(
      [
        {
          actId: 1,
          name: 'A',
          kind: 'dance',
          sessionYear: 2026,
          closed: false,
          viewerInCast: true,
        },
        {
          actId: 2,
          name: 'B',
          kind: 'dance',
          sessionYear: 2026,
          closed: false,
          viewerInCast: false,
        },
        {
          actId: 3,
          name: 'C',
          kind: 'dance',
          sessionYear: 2026,
          closed: true,
          viewerInCast: false,
        },
      ],
      [
        myAct(1, {}),
        myAct(9, { group: { groupId: 2, name: 'K', tone: null, icon: null, picture: null } }),
      ],
      1,
    );

    expect(acts.cards.map((act) => act.actId)).toEqual([1]);
    expect(acts.rows.map((act) => act.actId)).toEqual([2]);
  });
});
