import type { GreetingAct } from './greeting-act';
import type { GreetingMemory } from './greeting-memory';

export type GreetingPlay = 'still' | 'live' | 'full' | 'nod' | 'daily';

export interface GreetingPlayDecision {
  play: GreetingPlay;
  burst: boolean;
}

export const greetingPlayOf = (
  act: Pick<GreetingAct, 'moment' | 'key' | 'sessionYear'>,
  memory: GreetingMemory | null,
  reducedMotion: boolean,
  cellCount: number,
): GreetingPlayDecision => {
  if (reducedMotion) {
    return { play: 'still', burst: false };
  }
  if (act.moment === 'openingCountdown') {
    return { play: 'live', burst: false };
  }

  const burst = act.moment === 'carnivalCall' && memory?.burstYear !== act.sessionYear;

  if (burst || memory === null || memory.cells.length !== cellCount) {
    return { play: 'full', burst };
  }

  return { play: memory.key === act.key ? 'nod' : 'daily', burst: false };
};
