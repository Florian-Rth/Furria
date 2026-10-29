import { KkStudioEStepsGroup } from './internal/layout/KkStudioEStepsGroup';
import { KkStudioEStepsHead } from './internal/layout/KkStudioEStepsHead';
import { KkStudioEStepsList } from './internal/layout/KkStudioEStepsList';
import { KkStudioEStepsRoot } from './internal/layout/KkStudioEStepsRoot';
import { KkStudioEStepsClose } from './internal/ui/KkStudioEStepsClose';
import { KkStudioEStepsGroupHead } from './internal/ui/KkStudioEStepsGroupHead';
import { KkStudioEStepsRow } from './internal/ui/KkStudioEStepsRow';
import { KkStudioEStepsThumb } from './internal/ui/KkStudioEStepsThumb';
import { KkStudioEStepsTitle } from './internal/ui/KkStudioEStepsTitle';
import { KkStudioEStepsTrigger } from './internal/ui/KkStudioEStepsTrigger';

export type {
  KkStudioEStepsThumbDot,
  KkStudioEStepsThumbKind,
} from './internal/ui/KkStudioEStepsThumb';

export const KkStudioESteps = Object.assign(KkStudioEStepsRoot, {
  Head: KkStudioEStepsHead,
  Title: KkStudioEStepsTitle,
  Close: KkStudioEStepsClose,
  List: KkStudioEStepsList,
  Group: KkStudioEStepsGroup,
  GroupHead: KkStudioEStepsGroupHead,
  Row: KkStudioEStepsRow,
  Thumb: KkStudioEStepsThumb,
  Trigger: KkStudioEStepsTrigger,
});
