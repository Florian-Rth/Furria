import { KkStepListRoot } from './internal/layout/KkStepListRoot';
import { KkStepListLater } from './internal/ui/KkStepListLater';
import { KkStepListStep } from './internal/ui/KkStepListStep';

export const KkStepList = Object.assign(KkStepListRoot, {
  Step: KkStepListStep,
  Later: KkStepListLater,
});
