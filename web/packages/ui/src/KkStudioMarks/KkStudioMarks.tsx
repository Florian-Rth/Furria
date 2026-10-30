import { KkStudioMarksRoot } from './internal/layout/KkStudioMarksRoot';
import { KkStudioMarksBorder } from './internal/ui/KkStudioMarksBorder';
import { KkStudioMarksPart } from './internal/ui/KkStudioMarksPart';
import { KkStudioMarksStep } from './internal/ui/KkStudioMarksStep';

export const KkStudioMarks = Object.assign(KkStudioMarksRoot, {
  Part: KkStudioMarksPart,
  Step: KkStudioMarksStep,
  Border: KkStudioMarksBorder,
});
