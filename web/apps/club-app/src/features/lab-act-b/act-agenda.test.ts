import { describe, expect, it } from 'vitest';
import type { MyAct, Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import type { AgendaItem } from './act-agenda';
import {
  agendaItemsOf,
  agendaTemplateOf,
  agendaWeeksOf,
  askableNamesOf,
  practiceBarOf,
  shownAgendaOf,
} from './act-agenda';

const NOW = Date.parse('2026-10-30T10:00:00+01:00');

const person = (personId: number, firstName: string): CastPerson => ({
  personId,
  firstName,
  lastName: 'X',
  portrait: null,
  absent: false,
});

const studio = (): Studio => ({
  music: { lengthSeconds: 0, source: 'workingMix' },
  songs: [],
  finalTracks: [],
  steps: [],
  parts: [],
  spots: [],
  videos: [],
  choreography: null,
  stage: null,
  evenings: [
    {
      eventId: 1,
      title: 'Gestern',
      startsAt: '2026-10-29T19:00:00+01:00',
      appearance: {
        appearanceId: 1,
        position: 0,
        stageStartsAt: null,
        added: [],
        removedPersonIds: [],
        spotChanges: [],
        choreography: null,
      },
    },
    {
      eventId: 2,
      title: 'Prunksitzung',
      startsAt: '2026-11-11T19:00:00+01:00',
      appearance: {
        appearanceId: 2,
        position: 3,
        stageStartsAt: '2026-11-11T20:00:00+01:00',
        added: [],
        removedPersonIds: [],
        spotChanges: [],
        choreography: null,
      },
    },
    { eventId: 3, title: 'Nicht dabei', startsAt: '2026-11-05T19:00:00+01:00', appearance: null },
  ],
  trainings: [
    {
      calendarEntryId: 10,
      title: 'Training',
      startsAt: '2026-11-03T19:00:00+01:00',
      openSpotIds: [],
      responses: [
        { personId: 7, answer: 'no', isRecordedOnBehalf: false, recordedBy: null, trail: [] },
        { personId: 8, answer: 'yes', isRecordedOnBehalf: false, recordedBy: null, trail: [] },
      ],
    },
  ],
});

const myAct = (overrides: Partial<MyAct>): MyAct => ({
  actId: 6,
  name: 'Ballett',
  kind: 'dance',
  sessionYear: 2026,
  group: null,
  viewerInCast: true,
  viewerLeads: false,
  playable: false,
  cast: [person(7, 'Kevin'), person(8, 'Uwe')],
  editors: [],
  nextEvening: {
    eventId: 2,
    title: 'Prunksitzung',
    startsAt: '2026-11-11T19:00:00+01:00',
    position: null,
    stageStartsAt: null,
  },
  nextTraining: {
    calendarEntryId: 10,
    title: 'Training',
    startsAt: '2026-11-03T19:00:00+01:00',
    viewerAnswer: null,
    present: 1,
    absent: 1,
  },
  ...overrides,
});

const keysOf = (items: readonly AgendaItem[]): string[] => items.map((item) => item.key);

describe('agendaTemplateOf', () => {
  it.each([
    ['dance', 'studio'],
    ['show', 'studio'],
    [null, 'studio'],
    ['speech', 'stage'],
    ['music', 'stage'],
    ['point', 'point'],
  ] as const)('%s gets the %s template', (kind, template) => {
    expect(agendaTemplateOf(kind)).toBe(template);
  });
});

describe('agendaItemsOf', () => {
  const cast = [person(7, 'Kevin'), person(8, 'Uwe')];

  it('lists coming evenings she dances at and trainings in time order', () => {
    const items = agendaItemsOf(
      { template: 'studio', studio: studio(), cast, myAct: null, viewerId: 7 },
      NOW,
    );

    expect(keysOf(items)).toEqual(['training-10', 'evening-2']);
  });

  it('carries her own answer and the tally of the cast', () => {
    const [training] = agendaItemsOf(
      { template: 'studio', studio: studio(), cast, myAct: null, viewerId: 7 },
      NOW,
    );

    expect(training).toMatchObject({ answer: 'no', tally: { present: 1, expected: 2 } });
  });

  it('keeps only evenings for a speech', () => {
    const items = agendaItemsOf(
      { template: 'stage', studio: studio(), cast, myAct: null, viewerId: 7 },
      NOW,
    );

    expect(keysOf(items)).toEqual(['evening-2']);
  });

  it('falls back to the next evening and training of her acts without the studio read', () => {
    const items = agendaItemsOf(
      { template: 'studio', studio: null, cast, myAct: myAct({}), viewerId: 7 },
      NOW,
    );

    expect(items).toMatchObject([
      { key: 'training-10', answer: null, tally: { present: 1, expected: 2 } },
      { key: 'evening-2' },
    ]);
  });
});

const trainingOn = (startsAt: string, id: number): AgendaItem => ({
  kind: 'training',
  key: `training-${id}`,
  calendarEntryId: id,
  title: 'Training',
  startsAt,
  answer: null,
  tally: { present: 0, expected: 0 },
});

describe('agendaWeeksOf', () => {
  it('groups this week, next week and later months and marks only the first item current', () => {
    const weeks = agendaWeeksOf(
      [
        trainingOn('2026-10-31T19:00:00+01:00', 1),
        trainingOn('2026-11-02T19:00:00+01:00', 2),
        trainingOn('2026-11-08T19:00:00+01:00', 3),
        trainingOn('2026-11-08T21:00:00+01:00', 6),
        trainingOn('2026-11-09T19:00:00+01:00', 4),
        trainingOn('2027-01-12T19:00:00+01:00', 5),
      ],
      NOW,
    );

    expect(
      weeks.map((week) => ({
        span: week.span,
        lead: week.lead,
        current: week.entries.map((entry) => entry.current),
        sameDay: week.entries.map((entry) => entry.sameDay),
      })),
    ).toEqual([
      { span: { kind: 'thisWeek' }, lead: true, current: [true], sameDay: [false] },
      {
        span: { kind: 'nextWeek' },
        lead: false,
        current: [false, false, false],
        sameDay: [false, false, true],
      },
      {
        span: { kind: 'month', year: 2026, month: 11 },
        lead: false,
        current: [false],
        sameDay: [false],
      },
      {
        span: { kind: 'month', year: 2027, month: 1 },
        lead: false,
        current: [false],
        sameDay: [false],
      },
    ]);
  });
});

describe('shownAgendaOf', () => {
  const many = Array.from({ length: 12 }, (_, index) =>
    trainingOn(
      new Date(Date.parse('2026-11-20T19:00:00+01:00') + index * 86_400_000).toISOString(),
      index,
    ),
  );

  it.each([
    [false, 6, 6],
    [true, 12, 0],
  ])('expanded %s shows %i and hides %i', (expanded, shown, hidden) => {
    const result = shownAgendaOf(many, NOW, expanded);

    expect([result.items.length, result.hidden]).toEqual([shown, hidden]);
  });

  it('shows everything when only a couple would hide', () => {
    expect(shownAgendaOf(many.slice(0, 8), NOW, false).hidden).toBe(0);
  });
});

describe('practiceBarOf', () => {
  it.each([
    [{ template: 'stage', playable: false, canEditStudio: false }, 'none'],
    [{ template: 'studio', playable: true, canEditStudio: false }, 'play'],
    [{ template: 'studio', playable: false, canEditStudio: true }, 'compose'],
    [{ template: 'studio', playable: false, canEditStudio: false }, 'ask'],
  ] as const)('%o shows %s', (input, kind) => {
    expect(practiceBarOf({ ...input, askable: [] }).kind).toBe(kind);
  });
});

describe('askableNamesOf', () => {
  it('names the editors except herself', () => {
    expect(
      askableNamesOf(
        [
          { personId: 1, firstName: 'Thomas' },
          { personId: 7, firstName: 'Kevin' },
          { personId: 2, firstName: 'Florian' },
        ],
        7,
      ),
    ).toEqual(['Thomas', 'Florian']);
  });
});
