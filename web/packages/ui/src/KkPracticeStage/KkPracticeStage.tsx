import { KkPracticeStageRoot } from './internal/layout/KkPracticeStageRoot';
import { KkPracticeStageCue } from './internal/ui/KkPracticeStageCue';
import { KkPracticeStageDot } from './internal/ui/KkPracticeStageDot';
import { KkPracticeStageGhost } from './internal/ui/KkPracticeStageGhost';

export type {
  KkPracticeStageCueSide,
  KkPracticeStageCueTone,
} from './internal/ui/KkPracticeStageCue';
export type { KkPracticeStageDotKind } from './internal/ui/KkPracticeStageDot';
export type { KkPracticeStageGhostPoint } from './internal/ui/KkPracticeStageGhost';

export const KkPracticeStage = Object.assign(KkPracticeStageRoot, {
  Dot: KkPracticeStageDot,
  Ghost: KkPracticeStageGhost,
  Cue: KkPracticeStageCue,
});
