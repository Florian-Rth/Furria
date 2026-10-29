import { KkPracticeStepsGroup } from './internal/layout/KkPracticeStepsGroup';
import { KkPracticeStepsHead } from './internal/layout/KkPracticeStepsHead';
import { KkPracticeStepsList } from './internal/layout/KkPracticeStepsList';
import { KkPracticeStepsRoot } from './internal/layout/KkPracticeStepsRoot';
import { KkPracticeStepsClose } from './internal/ui/KkPracticeStepsClose';
import { KkPracticeStepsGroupHead } from './internal/ui/KkPracticeStepsGroupHead';
import { KkPracticeStepsRow } from './internal/ui/KkPracticeStepsRow';
import { KkPracticeStepsThumb } from './internal/ui/KkPracticeStepsThumb';
import { KkPracticeStepsTitle } from './internal/ui/KkPracticeStepsTitle';
import { KkPracticeStepsTrigger } from './internal/ui/KkPracticeStepsTrigger';

export type {
  KkPracticeStepsThumbDot,
  KkPracticeStepsThumbKind,
} from './internal/ui/KkPracticeStepsThumb';

export const KkPracticeSteps = Object.assign(KkPracticeStepsRoot, {
  Head: KkPracticeStepsHead,
  Title: KkPracticeStepsTitle,
  Close: KkPracticeStepsClose,
  List: KkPracticeStepsList,
  Group: KkPracticeStepsGroup,
  GroupHead: KkPracticeStepsGroupHead,
  Row: KkPracticeStepsRow,
  Thumb: KkPracticeStepsThumb,
  Trigger: KkPracticeStepsTrigger,
});
