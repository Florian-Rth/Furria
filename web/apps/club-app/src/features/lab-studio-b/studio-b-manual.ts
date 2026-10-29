import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep } from '@/features/act-player/music-timeline';
import { videoAt } from '@/features/act-player/video-sync';
import type {
  StudioPart,
  StudioSpot,
  StudioStage,
  StudioStep,
  StudioVideo,
} from '@/features/acts/schemas';
import { eightsIn } from './studio-b-beats';
import type { FormationDot } from './studio-b-formation';
import { formationAt } from './studio-b-formation';

const VIDEO_PROBE_SECONDS = 0.05;

export interface ManualStep {
  stepId: number;
  number: number;
  name: string;
  description: string | null;
  range: TimelineRange;
  eights: number;
  hasVideo: boolean;
  formation: FormationDot[];
}

export interface ManualPart {
  key: string;
  partId: number | null;
  name: string | null;
  range: TimelineRange;
  eights: number;
  steps: ManualStep[];
}

export interface LooseStep {
  stepId: number;
  name: string;
}

export interface Manual {
  parts: ManualPart[];
  loose: LooseStep[];
  stepCount: number;
}

export interface ManualInput {
  steps: readonly StudioStep[];
  allSteps: readonly StudioStep[];
  parts: readonly StudioPart[];
  videos: readonly StudioVideo[];
  countMarks: readonly CountMark[];
  paths: readonly SpotPath[];
  spots: readonly StudioSpot[];
  stage: StudioStage;
  ownSpotId: number | null;
}

const rangeOfStep = (step: StudioStep): TimelineRange => ({
  start: step.startSeconds ?? 0,
  end: step.endSeconds ?? step.startSeconds ?? 0,
});

const manualStepOf = (input: ManualInput, step: StudioStep, index: number): ManualStep => {
  const range = rangeOfStep(step);

  return {
    stepId: step.stepId,
    number: index + 1,
    name: step.name,
    description: step.description,
    range,
    eights: eightsIn(input.countMarks, range),
    hasVideo:
      videoAt(input.videos, input.parts, input.steps, range.start + VIDEO_PROBE_SECONDS) !== null,
    formation: formationAt(input.paths, input.spots, input.stage, input.ownSpotId, range.start),
  };
};

const partKeyOf = (part: StudioPart | null, start: number): string =>
  part === null ? `unparted-${start}` : `part-${part.partId}`;

const closePart = (
  part: StudioPart | null,
  steps: readonly ManualStep[],
  marks: readonly CountMark[],
): ManualPart => {
  const first = steps[0]?.range.start ?? 0;
  const range = { start: first, end: steps.at(-1)?.range.end ?? first };

  return {
    key: partKeyOf(part, first),
    partId: part?.partId ?? null,
    name: part?.name ?? null,
    range,
    eights: eightsIn(marks, range),
    steps: [...steps],
  };
};

interface PartRun {
  part: StudioPart | null;
  steps: ManualStep[];
}

const partRunsOf = (input: ManualInput): PartRun[] => {
  const runs: PartRun[] = [];

  for (const [index, step] of input.steps.entries()) {
    const part = partOfStep(input.parts, step.stepId);
    const manualStep = manualStepOf(input, step, index);
    const last = runs.at(-1);

    if (last !== undefined && last.part?.partId === part?.partId) {
      last.steps.push(manualStep);
    } else {
      runs.push({ part, steps: [manualStep] });
    }
  }

  return runs;
};

export const manualOf = (input: ManualInput): Manual => {
  const timed = new Set(input.steps.map((step) => step.stepId));

  return {
    parts: partRunsOf(input).map((run) => closePart(run.part, run.steps, input.countMarks)),
    loose: input.allSteps
      .filter((step) => !timed.has(step.stepId))
      .map((step) => ({ stepId: step.stepId, name: step.name })),
    stepCount: input.steps.length,
  };
};

export const partOfManualStep = (manual: Manual, stepId: number): ManualPart | null =>
  manual.parts.find((part) => part.steps.some((step) => step.stepId === stepId)) ?? null;

export const manualStepOfId = (manual: Manual, stepId: number | null): ManualStep | null =>
  manual.parts.flatMap((part) => part.steps).find((step) => step.stepId === stepId) ?? null;

export interface StripBand {
  key: string;
  name: string | null;
  start: number;
  end: number;
}

export const stripBandsOf = (manual: Manual, length: number): StripBand[] =>
  length <= 0
    ? []
    : manual.parts.map((part) => ({
        key: part.key,
        name: part.name,
        start: part.range.start / length,
        end: Math.min(1, part.range.end / length),
      }));

export const stripTicksOf = (manual: Manual, length: number): number[] =>
  length <= 0
    ? []
    : manual.parts.flatMap((part) => part.steps.slice(1).map((step) => step.range.start / length));

export const stripLoopOf = (loop: TimelineRange | null, length: number): TimelineRange | null =>
  loop === null || length <= 0
    ? null
    : { start: loop.start / length, end: Math.min(1, loop.end / length) };

export type ManualEntry =
  | { kind: 'part'; key: string; part: ManualPart; current: boolean }
  | { kind: 'step'; key: string; step: ManualStep; current: boolean }
  | { kind: 'card'; key: string }
  | { kind: 'loose'; key: string; step: LooseStep };

export const CARD_ENTRY_KEY = 'card';

const stepEntryOf = (
  step: ManualStep,
  currentId: number | null,
  cardInList: boolean,
): ManualEntry => {
  const current = step.stepId === currentId;

  return current && cardInList
    ? { kind: 'card', key: CARD_ENTRY_KEY }
    : { kind: 'step', key: `step-${step.stepId}`, step, current };
};

export const manualEntriesOf = (
  manual: Manual,
  currentId: number | null,
  cardInList: boolean,
): ManualEntry[] => [
  ...manual.parts.flatMap((part): ManualEntry[] => [
    {
      kind: 'part',
      key: part.key,
      part,
      current: part.steps.some((step) => step.stepId === currentId),
    },
    ...part.steps.map((step) => stepEntryOf(step, currentId, cardInList)),
  ]),
  ...manual.loose.map(
    (step): ManualEntry => ({ kind: 'loose', key: `loose-${step.stepId}`, step }),
  ),
];
