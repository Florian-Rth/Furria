import type { RefObject } from 'react';
import { createContext, useContext } from 'react';
import type { KkGreetingPlay } from './flap-schedule';
import type { GreetingBoard } from './greeting-board';
import type { GreetingPhase } from './greeting-cues';

export interface GreetingStage {
  play: KkGreetingPlay;
  festive: boolean;
  night: boolean;
  burst: boolean;
  phase: GreetingPhase;
  board: GreetingBoard | null;
  rootRef: RefObject<HTMLDivElement | null>;
  publish: (board: GreetingBoard) => void;
  interrupt: () => void;
}

export const GreetingStageContext = createContext<GreetingStage | null>(null);

export const useGreetingStage = (): GreetingStage => {
  const stage = useContext(GreetingStageContext);

  if (stage === null) {
    throw new Error('A greeting part was rendered outside KkGreeting.');
  }

  return stage;
};
