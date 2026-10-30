import { KkTrainingViewControls } from './internal/layout/KkTrainingViewControls';
import { KkTrainingViewCount } from './internal/layout/KkTrainingViewCount';
import { KkTrainingViewGaps } from './internal/layout/KkTrainingViewGaps';
import { KkTrainingViewHead } from './internal/layout/KkTrainingViewHead';
import { KkTrainingViewRoot } from './internal/layout/KkTrainingViewRoot';
import { KkTrainingViewStage } from './internal/layout/KkTrainingViewStage';
import { KkTrainingViewBeat } from './internal/ui/KkTrainingViewBeat';
import { KkTrainingViewHeading } from './internal/ui/KkTrainingViewHeading';
import { KkTrainingViewKeys } from './internal/ui/KkTrainingViewKeys';
import { KkTrainingViewNotice } from './internal/ui/KkTrainingViewNotice';

export const KkTrainingView = Object.assign(KkTrainingViewRoot, {
  Head: KkTrainingViewHead,
  Count: KkTrainingViewCount,
  Gaps: KkTrainingViewGaps,
  Stage: KkTrainingViewStage,
  Controls: KkTrainingViewControls,
  Heading: KkTrainingViewHeading,
  Beat: KkTrainingViewBeat,
  Notice: KkTrainingViewNotice,
  Keys: KkTrainingViewKeys,
});
