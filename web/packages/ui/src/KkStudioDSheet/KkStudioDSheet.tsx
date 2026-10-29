import { KkStudioDSheetRoot } from './internal/layout/KkStudioDSheetRoot';
import { KkStudioDSheetGroup } from './internal/ui/KkStudioDSheetGroup';
import { KkStudioDSheetStep } from './internal/ui/KkStudioDSheetStep';

export const KkStudioDSheet = Object.assign(KkStudioDSheetRoot, {
  Group: KkStudioDSheetGroup,
  Step: KkStudioDSheetStep,
});
