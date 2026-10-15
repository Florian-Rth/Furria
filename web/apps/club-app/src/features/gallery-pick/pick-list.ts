export type PickListPhase = 'loading' | 'failed' | 'empty' | 'ready';

export const pickListPhaseOf = (count: number | undefined, error: Error | null): PickListPhase => {
  if (count !== undefined) {
    return count === 0 ? 'empty' : 'ready';
  }
  return error === null ? 'loading' : 'failed';
};
