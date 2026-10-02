import type { FlapTileTone } from '../../../internal/flap/FlapTile';
import { kkTokens } from '../../../tokens';
import type { FlapCell } from './flap-cells';
import { previousFacesOf } from './flap-cells';

export type KkGreetingPlay = 'still' | 'live' | 'full' | 'nod' | 'daily';
export type KkGreetingTempo = 'regular' | 'slow';
export type FlapPlay = KkGreetingPlay | 'tick';

export type FlapFace = { kind: 'text'; text: string } | { kind: 'deck'; slot: number };

export type FlapFlipKind = 'face' | 'final' | 'strike' | 'tick';

export interface FlapFlip {
  kind: FlapFlipKind;
  at: number;
  duration: number;
}

export interface FlapTurnRun {
  motion: 'flap' | 'tick';
  cell: number;
  start: number;
  end: number;
  faces: FlapFace[];
  flips: FlapFlip[];
}

export interface FlapFadeRun {
  motion: 'fade';
  cell: number;
  start: number;
  end: number;
}

export type FlapRun = FlapTurnRun | FlapFadeRun;

export interface FlapCue {
  at: number;
  duration: number;
}

export interface FlapSchedule {
  runs: FlapRun[];
  tone: FlapTileTone;
  line: FlapCue | null;
  burstAt: number | null;
  duration: number;
}

export interface FlapScheduleRequest {
  cells: readonly FlapCell[];
  previousCells: readonly string[] | null;
  play: FlapPlay;
  festive: boolean;
  night: boolean;
  burst: boolean;
  tempo: KkGreetingTempo;
  countFrom: number | null;
}

type Landing = 'final' | 'strike';

interface CellPlan {
  cell: number;
  from: FlapFace;
  steps: FlapFace[];
  landing: Landing;
  counted: boolean;
}

const { faceMs, finalMs, staggerMs, maxConcurrent, maxCells } = kkTokens.motion.flap;
const { budgetMs } = kkTokens.motion.greeting;

const SLOW_FACE_MS = 160;
const TICK_MS = 180;
const NIGHT_FADE_MS = 240;
const NIGHT_STAGGER_MS = 30;
const LINE_MS = 160;
const LINE_LEAD_MS = 340;
const ARRIVAL_SETTLE_MS = 960;
const FESTIVE_SETTLE_MS = 1450;
const DAILY_SETTLE_MS = 600;
const WORD_FACES = 2;
const FESTIVE_WORD_FACES = 3;
const DAILY_WORD_FACES = 1;
const ROLL_FACES = 4;
const COUNT_FACES = 6;
const DIGITS = 10;

const BLANK: FlapFace = { kind: 'text', text: '' };

const EMPTY_SCHEDULE: FlapSchedule = {
  runs: [],
  tone: 'ink',
  line: null,
  burstAt: null,
  duration: 0,
};

const textFace = (text: string): FlapFace => ({ kind: 'text', text });

const deckFaces = (count: number): FlapFace[] =>
  Array.from({ length: count }, (_, slot) => ({ kind: 'deck', slot }));

const sameFace = (left: FlapFace, right: FlapFace): boolean =>
  left.kind === 'text' && right.kind === 'text'
    ? left.text === right.text
    : left.kind === 'deck' && right.kind === 'deck' && left.slot === right.slot;

const faceStepOf = (tempo: KkGreetingTempo): number => (tempo === 'slow' ? SLOW_FACE_MS : faceMs);

const landingMsOf = (landing: Landing, step: number): number =>
  landing === 'strike' ? finalMs + step : finalMs;

const isArrival = (play: FlapPlay): boolean => play === 'full' || play === 'live';

const isAnimatable = (cell: FlapCell): boolean => cell.kind !== 'mark';

export const isTurnRun = (run: FlapRun): run is FlapTurnRun => run.motion !== 'fade';

const candidatesOf = (
  cells: readonly FlapCell[],
  previous: readonly (string | null)[],
  play: FlapPlay,
): number[] => {
  const changed = (index: number): boolean => previous[index] !== cells[index]?.face;

  const picked = cells.flatMap((cell, index) => {
    if (!isAnimatable(cell)) {
      return [];
    }
    if (isArrival(play)) {
      return [index];
    }
    if (play === 'daily') {
      return cell.role === 'name' || changed(index) ? [index] : [];
    }
    if (play === 'tick') {
      return cell.kind === 'digit' && previous[index] !== null && changed(index) ? [index] : [];
    }

    return changed(index) ? [index] : [];
  });

  return picked.slice(0, maxCells);
};

const rollOf = (digit: string): FlapFace[] => {
  const target = Number(digit);

  return Array.from({ length: ROLL_FACES }, (_, step) =>
    textFace(String((target - (ROLL_FACES - 1) + step + DIGITS) % DIGITS)),
  );
};

const countSequenceOf = (target: number, countFrom: number): string[] => {
  const first = Math.max(countFrom, target - (COUNT_FACES - 1), 0);

  return Array.from({ length: target - first + 1 }, (_, step) => String(first + step));
};

const countStepsOf = (sequence: readonly string[], position: number, width: number): FlapFace[] =>
  sequence.map((number) => {
    const index = number.length - (width - position);

    return textFace(index >= 0 ? (number[index] ?? '') : '');
  });

const countFacesOf = (
  cells: readonly FlapCell[],
  countFrom: number | null,
): Map<number, FlapFace[]> => {
  const counted = cells.flatMap((cell, index) =>
    cell.accent && cell.kind === 'digit' ? [index] : [],
  );
  const target = Number(counted.map((index) => cells[index]?.face ?? '').join(''));

  if (
    countFrom === null ||
    counted.length === 0 ||
    counted.length > maxConcurrent ||
    countFrom >= target
  ) {
    return new Map();
  }

  const sequence = countSequenceOf(target, countFrom);

  return new Map(
    counted.map((index, position) => [index, countStepsOf(sequence, position, counted.length)]),
  );
};

const arrivalFacesOf = (cell: FlapCell, festive: boolean): FlapFace[] => {
  const final = textFace(cell.face);

  if (cell.kind === 'digit') {
    return rollOf(cell.face);
  }

  return [...deckFaces(festive ? FESTIVE_WORD_FACES : WORD_FACES), final];
};

const stepsOf = (cell: FlapCell, play: FlapPlay): FlapFace[] => {
  const final = textFace(cell.face);

  if (play === 'daily' && cell.kind === 'word') {
    return [...deckFaces(DAILY_WORD_FACES), final];
  }

  return [final];
};

const openingOf = (faces: readonly FlapFace[]): Pick<CellPlan, 'from' | 'steps'> => {
  const [from = BLANK, ...steps] = faces;

  return { from, steps };
};

const plansOf = (
  request: FlapScheduleRequest,
  previous: readonly (string | null)[],
  candidates: readonly number[],
): CellPlan[] => {
  const { cells, play, festive, burst } = request;
  const counted = isArrival(play)
    ? countFacesOf(cells, request.countFrom)
    : new Map<number, FlapFace[]>();
  const lastCandidate = candidates.at(-1);

  return candidates.flatMap((index) => {
    const cell = cells[index];

    if (cell === undefined) {
      return [];
    }

    const countedSteps = counted.get(index);
    const before = previous[index] ?? null;
    const opening = isArrival(play)
      ? openingOf(countedSteps ?? arrivalFacesOf(cell, festive || burst))
      : { from: before === null ? BLANK : textFace(before), steps: stepsOf(cell, play) };

    return [
      {
        cell: index,
        ...opening,
        landing: burst && isArrival(play) && index === lastCandidate ? 'strike' : 'final',
        counted: countedSteps !== undefined,
      },
    ];
  });
};

const changeStepsOf = (plan: CellPlan): number[] =>
  plan.steps.flatMap((face, step) => {
    const before = step === 0 ? plan.from : plan.steps[step - 1];

    return before !== undefined && sameFace(before, face) ? [] : [step];
  });

const durationOf = (plan: CellPlan, step: number): number => {
  const last = changeStepsOf(plan).at(-1);

  return last === undefined ? 0 : last * step + landingMsOf(plan.landing, step);
};

const trimmedOf = (unit: readonly CellPlan[], budget: number, step: number): CellPlan[] => {
  let trimmed = [...unit];

  while (
    trimmed.every((plan) => plan.steps.length > 1) &&
    Math.max(...trimmed.map((plan) => durationOf(plan, step))) > budget
  ) {
    trimmed = trimmed.map((plan) => ({ ...plan, steps: plan.steps.slice(1) }));
  }

  return trimmed;
};

const unitsOf = (plans: readonly CellPlan[]): CellPlan[][] => {
  const units: CellPlan[][] = [];

  for (const plan of plans) {
    const last = units.at(-1);

    if (plan.counted && last?.[0]?.counted === true) {
      last.push(plan);
    } else {
      units.push([plan]);
    }
  }

  return units;
};

const flipsOf = (plan: CellPlan, start: number, step: number): FlapFlip[] => {
  const changes = changeStepsOf(plan);
  const last = changes.at(-1);

  return changes.map((index) => {
    const landing = index === last;

    return {
      kind: landing ? plan.landing : 'face',
      at: start + index * step,
      duration: landing ? landingMsOf(plan.landing, step) : step,
    };
  });
};

const facesOf = (plan: CellPlan): FlapFace[] => {
  const changes = changeStepsOf(plan);

  return [
    plan.from,
    ...changes.flatMap((index) => {
      const face = plan.steps[index];

      return face === undefined ? [] : [face];
    }),
  ];
};

const settleTargetOf = (request: FlapScheduleRequest): number => {
  if (request.tempo === 'slow') {
    return budgetMs;
  }
  if (request.play === 'daily') {
    return DAILY_SETTLE_MS;
  }
  if (request.festive || request.burst) {
    return FESTIVE_SETTLE_MS;
  }

  return ARRIVAL_SETTLE_MS;
};

const runBudgetOf = (count: number, stagger: number, target: number): number => {
  const lanes = Math.min(maxConcurrent, count);
  const perLane = Math.ceil(count / lanes);

  return Math.floor((target - (lanes - 1) * stagger) / perLane);
};

const startOf = (frees: readonly number[], earliest: number, needed: number): number => {
  const sorted = [...frees].sort((left, right) => left - right);

  return Math.max(earliest, sorted[Math.min(needed, sorted.length) - 1] ?? 0);
};

const runOf = (plan: CellPlan, start: number, step: number): FlapTurnRun => ({
  motion: 'flap',
  cell: plan.cell,
  start,
  end: start + durationOf(plan, step),
  faces: facesOf(plan),
  flips: flipsOf(plan, start, step),
});

interface Placement {
  runs: FlapTurnRun[];
  frees: number[];
  previousStart: number;
}

type RunCap = (start: number) => number;

const placedOf = (
  units: readonly CellPlan[][],
  stagger: number,
  step: number,
  capOf: RunCap,
): FlapTurnRun[] =>
  units.reduce<Placement>(
    (placement, unit) => {
      const start = startOf(placement.frees, placement.previousStart + stagger, unit.length);
      const runs = trimmedOf(unit, capOf(start), step)
        .map((plan) => runOf(plan, start, step))
        .filter((run) => run.flips.length > 0);
      const frees = runs.reduce((lanes, run) => {
        const lane = lanes.findIndex((free) => free <= start);

        return lanes.map((free, index) => (index === lane ? run.end : free));
      }, placement.frees);

      return { runs: [...placement.runs, ...runs], frees, previousStart: start };
    },
    {
      runs: [],
      frees: Array.from({ length: maxConcurrent }, () => 0),
      previousStart: -stagger,
    },
  ).runs;

const endOf = (runs: readonly FlapRun[]): number => Math.max(0, ...runs.map((run) => run.end));

const tickRunOf = (cells: readonly FlapCell[]): FlapTurnRun[] => {
  const last = cells.findLastIndex(isAnimatable);
  const cell = cells[last];

  if (cell === undefined) {
    return [];
  }

  const face = textFace(cell.face);

  return [
    {
      motion: 'tick',
      cell: last,
      start: 0,
      end: TICK_MS,
      faces: [face, face],
      flips: [{ kind: 'tick', at: 0, duration: TICK_MS }],
    },
  ];
};

const fadeRunsOf = (candidates: readonly number[]): FlapFadeRun[] =>
  candidates.map((cell, order) => {
    const start = order * NIGHT_STAGGER_MS;

    return { motion: 'fade', cell, start, end: start + NIGHT_FADE_MS };
  });

const turnRunsOf = (
  request: FlapScheduleRequest,
  previous: readonly (string | null)[],
  candidates: readonly number[],
): FlapTurnRun[] => {
  if (candidates.length === 0) {
    return request.play === 'nod' ? tickRunOf(request.cells) : [];
  }

  const step = faceStepOf(request.tempo);
  const stagger = request.play === 'tick' ? 0 : staggerMs;
  const target = settleTargetOf(request);
  const units = unitsOf(plansOf(request, previous, candidates));
  const frontLoaded = placedOf(units, stagger, step, (start) => target - start);

  if (endOf(frontLoaded) <= target) {
    return frontLoaded;
  }

  const even = runBudgetOf(candidates.length, stagger, target);

  return placedOf(units, stagger, step, () => even);
};

const lineOf = (play: FlapPlay, boardEnd: number): FlapCue | null =>
  isArrival(play) ? { at: Math.max(0, boardEnd - LINE_LEAD_MS), duration: LINE_MS } : null;

export const flapScheduleOf = (request: FlapScheduleRequest): FlapSchedule => {
  if (request.play === 'still') {
    return EMPTY_SCHEDULE;
  }

  const previous = previousFacesOf(request.cells, request.previousCells);
  const candidates = candidatesOf(request.cells, previous, request.play);
  const runs: FlapRun[] = request.night
    ? fadeRunsOf(candidates)
    : turnRunsOf(request, previous, candidates);
  const boardEnd = endOf(runs);
  const line = lineOf(request.play, boardEnd);
  const duration = Math.max(boardEnd, line === null ? 0 : line.at + line.duration);
  const bursts = request.burst && isArrival(request.play) && runs.length > 0;

  return {
    runs,
    tone: request.festive || request.burst ? 'gold' : 'ink',
    line,
    burstAt: bursts ? boardEnd : null,
    duration,
  };
};
