import { KkStudioAManualGroup } from './internal/layout/KkStudioAManualGroup';
import { KkStudioAManualList } from './internal/layout/KkStudioAManualList';
import { KkStudioAManualRoot } from './internal/layout/KkStudioAManualRoot';
import { KkStudioAManualHead } from './internal/ui/KkStudioAManualHead';
import { KkStudioAManualStep } from './internal/ui/KkStudioAManualStep';
import { KkStudioAManualThumb } from './internal/ui/KkStudioAManualThumb';

export type {
  KkStudioAManualHeadState,
  KkStudioAManualHeadTone,
} from './internal/ui/KkStudioAManualHead';
export type {
  KkStudioAManualStepState,
  KkStudioAManualStepTone,
} from './internal/ui/KkStudioAManualStep';
export type {
  KkStudioAManualThumbDot,
  KkStudioAManualThumbDotKind,
} from './internal/ui/KkStudioAManualThumb';

export const KkStudioAManual = Object.assign(KkStudioAManualRoot, {
  List: KkStudioAManualList,
  Group: KkStudioAManualGroup,
  Head: KkStudioAManualHead,
  Step: KkStudioAManualStep,
  Thumb: KkStudioAManualThumb,
});
