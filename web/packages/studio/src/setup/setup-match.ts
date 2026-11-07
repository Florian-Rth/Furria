export type MatchPhase = 'none' | 'waiting' | 'searching' | 'check' | 'missing' | 'failed';

export interface MatchFacts {
  chosen: boolean;
  ready: boolean;
  aligning: boolean;
  placed: boolean;
  searchFailed: boolean;
}

export const matchPhaseOf = ({
  chosen,
  ready,
  aligning,
  placed,
  searchFailed,
}: MatchFacts): MatchPhase => {
  if (!chosen) {
    return 'none';
  }
  if (!ready) {
    return 'waiting';
  }
  if (aligning) {
    return 'searching';
  }
  if (placed) {
    return 'check';
  }

  return searchFailed ? 'failed' : 'missing';
};
