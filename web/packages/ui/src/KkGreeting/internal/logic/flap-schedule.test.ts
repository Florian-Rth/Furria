import { describe, expect, it } from 'vitest';
import type { FlapCell, KkGreetingPart } from './flap-cells';
import { toFlapCells } from './flap-cells';
import type { FlapPlay, FlapSchedule, FlapScheduleRequest, KkGreetingTempo } from './flap-schedule';
import { flapScheduleOf } from './flap-schedule';

const plain = (text: string): KkGreetingPart => ({ text, role: 'plain' });
const value = (text: string): KkGreetingPart => ({ text, role: 'value' });
const named = (text: string): KkGreetingPart => ({ text, role: 'name' });

const SESSION_DAY = toFlapCells([
  plain('Tag '),
  value('70'),
  plain(' deiner '),
  value('12.'),
  plain(' Session, '),
  named('Lena'),
  plain('.'),
]);

const LONG_BOARD = toFlapCells([
  plain('Noch '),
  value('177'),
  plain(' Tage bis zu deiner '),
  value('33.'),
  plain(' Session, und dann geht es los, Lena!'),
]);

const CALL = toFlapCells([plain('Gross - Furria!')]);

const COUNTDOWN = toFlapCells([plain('Noch '), value('9:59'), plain(' bis 11:11.')]);

const ANNIVERSARY = toFlapCells([
  value('33'),
  plain(' Jahre seit deinem Beitritt, '),
  named('Lena'),
  plain('!'),
]);

const requestOf = (overrides: Partial<FlapScheduleRequest>): FlapScheduleRequest => ({
  cells: SESSION_DAY,
  previousCells: null,
  play: 'full',
  festive: false,
  burst: false,
  tempo: 'regular',
  countFrom: null,
  ...overrides,
});

const facesOf = (cells: readonly FlapCell[]): string[] => cells.map((cell) => cell.face);

const TRACKS_PER_TURN = 5;
const TRACKS_PER_LINE = 2;

const peakOf = (spans: readonly { start: number; end: number; weight: number }[]): number =>
  Math.max(
    0,
    ...spans.map((span) =>
      spans
        .filter((other) => other.start <= span.start && span.start < other.end)
        .reduce((sum, other) => sum + other.weight, 0),
    ),
  );

const turningAt = (schedule: FlapSchedule): number =>
  peakOf(schedule.runs.map((run) => ({ start: run.start, end: run.end, weight: 1 })));

const liveAt = (schedule: FlapSchedule): number =>
  peakOf([
    ...schedule.runs.map((run) => ({
      start: run.start,
      end: run.end,
      weight: TRACKS_PER_TURN,
    })),
    ...(schedule.line === null
      ? []
      : [
          {
            start: schedule.line.at,
            end: schedule.line.at + schedule.line.duration,
            weight: TRACKS_PER_LINE,
          },
        ]),
  ]);

const PLAYS: FlapPlay[] = ['live', 'full', 'tick'];
const MOODS: { tempo: KkGreetingTempo; festive: boolean; burst: boolean }[] = [
  { tempo: 'regular', festive: false, burst: false },
  { tempo: 'slow', festive: true, burst: true },
];
const BOARDS = [
  { name: 'a session day', cells: SESSION_DAY, previous: facesOf(LONG_BOARD) },
  { name: 'a long board', cells: LONG_BOARD, previous: facesOf(SESSION_DAY) },
  { name: 'the call', cells: CALL, previous: null },
  {
    name: 'a countdown',
    cells: COUNTDOWN,
    previous: ['Noch', '1', '0', ':', '0', '0', 'bis', '11:11.'],
  },
  { name: 'an anniversary', cells: ANNIVERSARY, previous: ['28', 'Jahre'] },
];
const VARIANTS = BOARDS.flatMap((board) =>
  PLAYS.flatMap((play) => MOODS.map((mood) => ({ ...board, play, ...mood }))),
);

describe('flapScheduleOf budget', () => {
  it.each(VARIANTS)(
    'keeps $name within budget for $play ($tempo, festive $festive, burst $burst)',
    ({ cells, previous, play, tempo, festive, burst }) => {
      const schedule = flapScheduleOf(
        requestOf({
          cells,
          previousCells: previous,
          play,
          tempo,
          festive,
          burst,
          countFrom: 28,
        }),
      );

      expect(schedule.duration).toBeLessThanOrEqual(1500);
      expect(turningAt(schedule)).toBeLessThanOrEqual(4);
      expect(liveAt(schedule)).toBeLessThanOrEqual(24);
      expect(new Set(schedule.runs.map((run) => run.cell)).size).toBeLessThanOrEqual(12);
    },
  );

  it.each([
    { festive: false, settled: 960 },
    { festive: true, settled: 1450 },
  ])('settles a full board (festive $festive) by $settled ms', ({ festive, settled }) => {
    expect(flapScheduleOf(requestOf({ cells: LONG_BOARD, festive })).duration).toBeLessThanOrEqual(
      settled,
    );
  });
});

describe('flapScheduleOf cells', () => {
  it('prints a still board at rest', () => {
    expect(flapScheduleOf(requestOf({ play: 'still' })).runs).toEqual([]);
  });

  it('turns every cell but the static marks on an arriving board', () => {
    const turned = flapScheduleOf(requestOf({ play: 'live' })).runs.map((run) => run.cell);

    expect(turned).toEqual([0, 1, 2, 3, 4, 5, 7, 8]);
  });

  it('prints the cells after the twelfth at rest', () => {
    const turned = flapScheduleOf(requestOf({ cells: LONG_BOARD })).runs.map((run) => run.cell);

    expect(LONG_BOARD.length).toBeGreaterThan(13);
    expect(turned).toHaveLength(12);
    expect(Math.max(...turned)).toBe(12);
  });

  it.each([
    { name: 'a session day', cells: SESSION_DAY, festive: false, countFrom: null },
    { name: 'the call', cells: CALL, festive: true, countFrom: null },
    { name: 'an anniversary', cells: ANNIVERSARY, festive: true, countFrom: 28 },
  ])(
    'opens every arriving tile of $name on a face it can print',
    ({ cells, festive, countFrom }) => {
      const openings = flapScheduleOf(requestOf({ cells, festive, countFrom })).runs.map(
        (run) => run.faces[0],
      );

      expect(openings.length).toBeGreaterThan(0);
      expect(
        openings.every(
          (face) => face?.kind === 'deck' || (face?.kind === 'text' && face.text !== ''),
        ),
      ).toBe(true);
    },
  );

  it('starts the cells in reading order', () => {
    const starts = flapScheduleOf(requestOf({})).runs.map((run) => run.start);

    expect(starts).toEqual([...starts].sort((left, right) => left - right));
  });

  it('flips only the changed digits together on a live tick', () => {
    const runs = flapScheduleOf(
      requestOf({
        cells: COUNTDOWN,
        play: 'tick',
        previousCells: ['Noch', '1', '0', ':', '0', '0', 'bis', '11:11.'],
      }),
    ).runs;

    expect(runs.map((run) => [run.cell, run.start, run.faces[0]])).toEqual([
      [1, 0, { kind: 'text', text: '0' }],
      [3, 0, { kind: 'text', text: '0' }],
      [4, 0, { kind: 'text', text: '0' }],
    ]);
  });

  it.each([
    { festive: false, burst: false, tone: 'ink' },
    { festive: true, burst: false, tone: 'gold' },
    { festive: false, burst: true, tone: 'gold' },
  ] as const)('uses $tone tiles (festive $festive, burst $burst)', ({ festive, burst, tone }) => {
    expect(flapScheduleOf(requestOf({ festive, burst })).tone).toBe(tone);
  });

  it.each([
    { festive: false, faces: 2 },
    { festive: true, faces: 3 },
  ])(
    'rattles $faces deck faces through a short word cell (festive $festive)',
    ({ festive, faces }) => {
      const run = flapScheduleOf(requestOf({ cells: CALL, festive })).runs[0];

      expect(run?.faces.filter((face) => face.kind === 'deck')).toHaveLength(faces);
    },
  );

  it('lands the last cell of the call last with a double rebound and bursts then', () => {
    const schedule = flapScheduleOf(requestOf({ cells: CALL, burst: true }));
    const runs = schedule.runs;
    const last = runs.at(-1);

    expect(last?.cell).toBe(2);
    expect(last?.flips.at(-1)?.kind).toBe('strike');
    expect(Math.max(...runs.map((run) => run.end))).toBe(last?.end);
    expect(schedule.burstAt).toBe(last?.end);
  });

  it('holds no burst without the call', () => {
    expect(flapScheduleOf(requestOf({ cells: CALL })).burstAt).toBeNull();
  });

  it('counts the anniversary years up from the given number', () => {
    const runs = flapScheduleOf(requestOf({ cells: ANNIVERSARY, countFrom: 28 })).runs;
    const [tens, units] = runs;

    expect(tens?.start).toBe(units?.start);
    expect(tens?.faces.map((face) => (face.kind === 'text' ? face.text : '?'))).toEqual(['2', '3']);
    expect(units?.faces.map((face) => (face.kind === 'text' ? face.text : '?'))).toEqual([
      '8',
      '9',
      '0',
      '1',
      '2',
      '3',
    ]);
  });

  it('rolls a digit upward onto its target', () => {
    const run = flapScheduleOf(requestOf({ cells: COUNTDOWN })).runs.find(
      (turn) => turn.cell === 1,
    );
    const digits = run === undefined ? [] : run.faces.slice(1);
    const rolled = digits.map((face) => (face.kind === 'text' ? Number(face.text) : -1));

    expect(rolled.at(-1)).toBe(9);
    expect(rolled.slice(1).every((digit, index) => digit === ((rolled[index] ?? 0) + 1) % 10)).toBe(
      true,
    );
  });

  it.each([
    { play: 'full', line: true },
    { play: 'tick', line: false },
  ] as const)('cues the line on a $play board: $line', ({ play, line }) => {
    const schedule = flapScheduleOf(requestOf({ play, previousCells: facesOf(SESSION_DAY) }));

    expect(schedule.line !== null).toBe(line);
  });

  it('brings the line in before the board settles', () => {
    const schedule = flapScheduleOf(requestOf({}));

    expect((schedule.line?.at ?? 0) + (schedule.line?.duration ?? 0)).toBeLessThanOrEqual(
      schedule.duration,
    );
  });
});
