import { PRACTICE_RATES, steppedRateOf } from '@furria/studio/practice-stepping';
import type { StudioKeyActions } from '@furria/studio/studio-keys';
import type { Practice } from './hooks/use-practice';

export const practiceKeyActionsOf = (
  practice: Practice,
  rates: readonly number[],
  loop: () => void,
): StudioKeyActions => ({
  toggle: practice.toggle,
  stepBack: () => {
    practice.skip('back');
  },
  stepForward: () => {
    practice.skip('forward');
  },
  faster: () => {
    practice.setRate(steppedRateOf(rates, practice.rate, 'faster'));
  },
  slower: () => {
    practice.setRate(steppedRateOf(rates, practice.rate, 'slower'));
  },
  loop,
});

export const playerKeyActionsOf = (practice: Practice): StudioKeyActions =>
  practiceKeyActionsOf(practice, PRACTICE_RATES, () => {
    if (practice.step !== null) {
      practice.loopStep(practice.step.stepId);
    }
  });
