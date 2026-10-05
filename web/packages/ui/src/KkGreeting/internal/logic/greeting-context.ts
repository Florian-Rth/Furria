import type { MotionValue } from 'motion/react';
import { createContext, useContext } from 'react';
import type { FlapSchedule, KkGreetingPlay } from './flap-schedule';
import type { GreetingPhase } from './greeting-cues';

export interface GreetingStage {
  play: KkGreetingPlay;
  festive: boolean;
  burst: boolean;
  phase: GreetingPhase;
  schedule: FlapSchedule | null;
  clock: MotionValue<number>;
  root: HTMLDivElement | null;
  attach: (root: HTMLDivElement | null) => void;
  publish: (schedule: FlapSchedule) => void;
  run: (duration: number) => void;
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
