import { KkStudioHMarksRoot } from './internal/layout/KkStudioHMarksRoot';
import { KkStudioHMarksBorder } from './internal/ui/KkStudioHMarksBorder';
import { KkStudioHMarksPart } from './internal/ui/KkStudioHMarksPart';
import { KkStudioHMarksStep } from './internal/ui/KkStudioHMarksStep';

export const KkStudioHMarks = Object.assign(KkStudioHMarksRoot, {
  Part: KkStudioHMarksPart,
  Step: KkStudioHMarksStep,
  Border: KkStudioHMarksBorder,
});
