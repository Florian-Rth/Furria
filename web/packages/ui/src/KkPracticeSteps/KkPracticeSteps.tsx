import { KkPracticeStepsGroup } from './internal/layout/KkPracticeStepsGroup';
import { KkPracticeStepsHead } from './internal/layout/KkPracticeStepsHead';
import { KkPracticeStepsKeys } from './internal/layout/KkPracticeStepsKeys';
import { KkPracticeStepsList } from './internal/layout/KkPracticeStepsList';
import { KkPracticeStepsPanel } from './internal/layout/KkPracticeStepsPanel';
import { KkPracticeStepsRoot } from './internal/layout/KkPracticeStepsRoot';
import { KkPracticeStepsClose } from './internal/ui/KkPracticeStepsClose';
import { KkPracticeStepsGroupHead } from './internal/ui/KkPracticeStepsGroupHead';
import { KkPracticeStepsRow } from './internal/ui/KkPracticeStepsRow';
import { KkPracticeStepsThumb } from './internal/ui/KkPracticeStepsThumb';
import { KkPracticeStepsTitle } from './internal/ui/KkPracticeStepsTitle';
import { KkPracticeStepsTraining } from './internal/ui/KkPracticeStepsTraining';
import { KkPracticeStepsTrigger } from './internal/ui/KkPracticeStepsTrigger';

export type {
  KkPracticeStepsThumbDot,
  KkPracticeStepsThumbKind,
} from './internal/ui/KkPracticeStepsThumb';

export const KkPracticeSteps = Object.assign(KkPracticeStepsRoot, {
  Head: KkPracticeStepsHead,
  Title: KkPracticeStepsTitle,
  Close: KkPracticeStepsClose,
  Training: KkPracticeStepsTraining,
  List: KkPracticeStepsList,
  Keys: KkPracticeStepsKeys,
  Panel: KkPracticeStepsPanel,
  Group: KkPracticeStepsGroup,
  GroupHead: KkPracticeStepsGroupHead,
  Row: KkPracticeStepsRow,
  Thumb: KkPracticeStepsThumb,
  Trigger: KkPracticeStepsTrigger,
});
