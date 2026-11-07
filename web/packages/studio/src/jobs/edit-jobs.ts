import type { SetupKey } from '@furria/studio/studio-setup';
import type { KkEjDeskFit } from '@furria/ui/KkEjDesk';
import type { KkEjLaneFocusRow } from '@furria/ui/KkEjLaneFocus';

export type EditJob = 'steps' | 'formation' | 'movement' | 'cast';
export type EditJobTool = 'formation' | 'movement';
export type StageGrip = 'watch' | 'arrange' | 'move' | 'pick';

export const EDIT_JOBS: readonly EditJob[] = ['steps', 'formation', 'movement', 'cast'];

const GRIPS: Record<EditJob, StageGrip> = {
  steps: 'watch',
  formation: 'arrange',
  movement: 'move',
  cast: 'pick',
};

const LANES: Record<EditJob, KkEjLaneFocusRow> = {
  steps: 'steps',
  formation: 'slim',
  movement: 'keys',
  cast: 'slim',
};

const FITS: Record<EditJob, KkEjDeskFit> = {
  steps: 'timeline',
  formation: 'stage',
  movement: 'balanced',
  cast: 'stage',
};

const SETUP_JOBS: Partial<Record<SetupKey, EditJob>> = {
  steps: 'steps',
  spots: 'cast',
  formation: 'formation',
};

export const jobToolOf = (job: EditJob): EditJobTool =>
  job === 'movement' ? 'movement' : 'formation';

export const stageGripOf = (job: EditJob): StageGrip => GRIPS[job];

export const jobLaneOf = (job: EditJob): KkEjLaneFocusRow => LANES[job];

export const deskFitOf = (job: EditJob): KkEjDeskFit => FITS[job];

export const jobOfSetup = (key: SetupKey): EditJob | null => SETUP_JOBS[key] ?? null;

export const firstJobOf = (stepCount: number): EditJob => (stepCount === 0 ? 'steps' : 'formation');

export interface CastCount {
  spots: number;
  held: number;
}

export const castCountOf = (spots: readonly { person: object | null }[]): CastCount => ({
  spots: spots.length,
  held: spots.filter((spot) => spot.person !== null).length,
});

export type FormationScope = { kind: 'all'; count: number } | { kind: 'chosen'; count: number };

export const formationScopeOf = (selected: number, total: number): FormationScope =>
  selected === 0 ? { kind: 'all', count: total } : { kind: 'chosen', count: selected };

export const pickedSpotOf = (selected: readonly number[]): number | null =>
  selected.length === 1 ? (selected[0] ?? null) : null;

export const pickedAfterHoldOf = (
  selected: readonly number[],
  spotId: number,
): readonly number[] | null => (pickedSpotOf(selected) === spotId ? null : [spotId]);

export const allPickedOf = (selected: number, total: number): boolean =>
  total > 0 && selected >= total;

export type ArrangeTool = 'mirror' | 'rowAcross' | 'rowDeep';

export const arrangeToolsOf = (selected: number): ArrangeTool[] => {
  if (selected === 0) {
    return [];
  }

  return selected === 1 ? ['mirror'] : ['mirror', 'rowAcross', 'rowDeep'];
};

export const copyDefaultOf = (current: number, steps: number): number | null => {
  if (steps < 2 || current < 0) {
    return null;
  }

  return current === 0 ? 1 : current - 1;
};

export const copySourceOf = (pick: number | null, current: number, steps: number): number | null =>
  pick !== null && pick >= 0 && pick < steps && pick !== current
    ? pick
    : copyDefaultOf(current, steps);

export const copyShiftOf = (
  source: number,
  direction: -1 | 1,
  current: number,
  steps: number,
): number | null => {
  const next = source + direction === current ? source + 2 * direction : source + direction;

  return next >= 0 && next < steps ? next : null;
};

export const COMPASS_POINTS: readonly number[] = [0, 45, 90, 135, 180, 225, 270, 315];

const FULL_TURN = 360;
const COMPASS_STEP = 45;

export const compassPointOf = (facing: number | null): number | null => {
  if (facing === null) {
    return null;
  }
  const turned = ((facing % FULL_TURN) + FULL_TURN) % FULL_TURN;

  return (Math.round(turned / COMPASS_STEP) * COMPASS_STEP) % FULL_TURN;
};

export const turnToOf = (facing: number | null, target: number): number => target - (facing ?? 0);

export type JobReason =
  | 'noMusic'
  | 'lastStep'
  | 'noSpots'
  | 'sessionOnly'
  | 'pickSpot'
  | 'noWaypoint'
  | 'noWay';

interface Reasoned {
  disabled: boolean;
  reason: JobReason | null;
}

export const reasonsOf = (actions: readonly Reasoned[]): JobReason[] => [
  ...new Set(
    actions.flatMap((action) => (action.disabled && action.reason !== null ? [action.reason] : [])),
  ),
];

export type SelectionChip = 'none' | 'spot' | 'count' | 'all';

export const selectionChipOf = (job: EditJob, selected: number, total: number): SelectionChip => {
  if (selected === 0 || stageGripOf(job) === 'watch') {
    return 'none';
  }
  if (total > 1 && selected >= total) {
    return 'all';
  }

  return job === 'cast' && selected === 1 ? 'spot' : 'count';
};

export interface CastSpot {
  spotId: number;
  number: number;
  personId: number | null;
}

export interface CastAssign {
  spotId: number;
  personId: number | null;
}

export type CastChoice = { kind: 'free' } | { kind: 'here' } | { kind: 'swap'; number: number };

export const castChoiceKindOf = (
  spots: readonly CastSpot[],
  spotId: number,
  personId: number,
): CastChoice => {
  const holding = spots.find((spot) => spot.personId === personId) ?? null;
  if (holding === null) {
    return { kind: 'free' };
  }

  return holding.spotId === spotId ? { kind: 'here' } : { kind: 'swap', number: holding.number };
};

export const castAssignsOf = (
  spots: readonly CastSpot[],
  spotId: number,
  personId: number,
): CastAssign[] => {
  const target = spots.find((spot) => spot.spotId === spotId) ?? null;
  const holding = spots.find((spot) => spot.personId === personId) ?? null;
  if (target === null || target.personId === personId) {
    return [];
  }
  const here: CastAssign = { spotId, personId };

  return holding === null ? [here] : [{ spotId: holding.spotId, personId: target.personId }, here];
};
