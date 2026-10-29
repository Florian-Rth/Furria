import { KkStudioCMomentRoot } from './internal/layout/KkStudioCMomentRoot';
import { KkStudioCMomentCount } from './internal/ui/KkStudioCMomentCount';
import { KkStudioCMomentStep } from './internal/ui/KkStudioCMomentStep';

export const KkStudioCMoment = Object.assign(KkStudioCMomentRoot, {
  Count: KkStudioCMomentCount,
  Step: KkStudioCMomentStep,
});
