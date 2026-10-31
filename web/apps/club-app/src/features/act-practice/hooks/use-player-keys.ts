import { PRACTICE_RATES } from '../practice-stepping';
import type { Practice } from './use-practice';
import { usePracticeKeys } from './use-practice-keys';

export const usePlayerKeys = (practice: Practice, active: boolean): void => {
  usePracticeKeys(active, practice, PRACTICE_RATES, () => {
    if (practice.step !== null) {
      practice.loopStep(practice.step.stepId);
    }
  });
};
