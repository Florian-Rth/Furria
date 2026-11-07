import type { SetupProgress } from '@furria/studio/setup-progress';

export type SetupStage = 'video' | 'borders' | 'names';

export type SetupPlace = SetupStage | 'finish';

export const SETUP_STAGES: readonly SetupStage[] = ['video', 'borders', 'names'];

export const nextPlaceOf = (stage: SetupStage): SetupPlace =>
  SETUP_STAGES[SETUP_STAGES.indexOf(stage) + 1] ?? 'finish';

export const previousStageOf = (place: SetupPlace): SetupStage | null =>
  place === 'finish' ? null : (SETUP_STAGES[SETUP_STAGES.indexOf(place) - 1] ?? null);

export interface SetupFacts {
  hasMusic: boolean;
  videoChosen: boolean;
  videoReady: boolean;
  videoPlaced: boolean;
  progress: SetupProgress;
}

export type StageGate = 'open' | 'noMusic' | 'noVideo' | 'videoWaiting' | 'notPlaced' | 'noSteps';

const NEEDS: Record<SetupPlace, readonly SetupStage[]> = {
  video: [],
  borders: ['video'],
  names: ['video', 'borders'],
  finish: ['video', 'borders'],
};

const passedOf = (place: SetupPlace, facts: SetupFacts): StageGate => {
  if (place === 'video') {
    if (!facts.hasMusic) {
      return 'noMusic';
    }
    if (!facts.videoChosen) {
      return 'noVideo';
    }
    if (!facts.videoReady) {
      return 'videoWaiting';
    }
    return facts.videoPlaced ? 'open' : 'notPlaced';
  }
  if (place === 'borders') {
    return facts.progress.total > 0 ? 'open' : 'noSteps';
  }

  return 'open';
};

export const stageGateOf = (place: SetupPlace, facts: SetupFacts): StageGate =>
  NEEDS[place].map((before) => passedOf(before, facts)).find((gate) => gate !== 'open') ?? 'open';

export const leaveGateOf = (place: SetupPlace, facts: SetupFacts): StageGate =>
  stageGateOf(place, facts) === 'open' ? passedOf(place, facts) : stageGateOf(place, facts);

const doneOf = (stage: SetupStage, facts: SetupFacts): boolean => {
  const { progress } = facts;
  const counted = progress.total > 0;
  switch (stage) {
    case 'video':
    case 'borders':
      return passedOf(stage, facts) === 'open';
    case 'names':
      return counted && progress.unnamed === 0;
  }
};

export type StageCellState = 'done' | 'open' | 'locked';

export interface StageCell {
  stage: SetupStage;
  current: boolean;
  state: StageCellState;
}

export const stageCellsOf = (current: SetupPlace, facts: SetupFacts): StageCell[] =>
  SETUP_STAGES.map((stage) => {
    const locked = stageGateOf(stage, facts) !== 'open';
    const state: StageCellState = locked ? 'locked' : doneOf(stage, facts) ? 'done' : 'open';

    return { stage, current: stage === current, state };
  });
