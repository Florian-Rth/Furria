import { KkStudioBManualCard } from './internal/layout/KkStudioBManualCard';
import { KkStudioBManualRoot } from './internal/layout/KkStudioBManualRoot';
import { KkStudioBManualHead } from './internal/ui/KkStudioBManualHead';
import { KkStudioBManualLater } from './internal/ui/KkStudioBManualLater';
import { KkStudioBManualLoose } from './internal/ui/KkStudioBManualLoose';
import { KkStudioBManualMasthead } from './internal/ui/KkStudioBManualMasthead';
import { KkStudioBManualNote } from './internal/ui/KkStudioBManualNote';
import { KkStudioBManualPart } from './internal/ui/KkStudioBManualPart';
import { KkStudioBManualStep } from './internal/ui/KkStudioBManualStep';

export type { KkStudioBManualCardPlacement } from './internal/layout/KkStudioBManualCard';
export type { KkStudioBManualHeadMove } from './internal/ui/KkStudioBManualHead';
export type { KkStudioBManualStepFormation } from './internal/ui/KkStudioBManualStep';

export const KkStudioBManual = Object.assign(KkStudioBManualRoot, {
  Masthead: KkStudioBManualMasthead,
  Part: KkStudioBManualPart,
  Step: KkStudioBManualStep,
  Loose: KkStudioBManualLoose,
  Later: KkStudioBManualLater,
  Card: KkStudioBManualCard,
  Head: KkStudioBManualHead,
  Note: KkStudioBManualNote,
});
