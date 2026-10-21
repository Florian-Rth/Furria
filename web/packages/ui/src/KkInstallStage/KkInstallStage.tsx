import { KkInstallStageActions } from './internal/layout/KkInstallStageActions';
import { KkInstallStageCopy } from './internal/layout/KkInstallStageCopy';
import { KkInstallStageHead } from './internal/layout/KkInstallStageHead';
import { KkInstallStageMeta } from './internal/layout/KkInstallStageMeta';
import { KkInstallStageRoot } from './internal/layout/KkInstallStageRoot';
import { KkInstallStageSteps } from './internal/layout/KkInstallStageSteps';
import { KkInstallStageStep } from './internal/ui/KkInstallStageStep';

export const KkInstallStage = Object.assign(KkInstallStageRoot, {
  Meta: KkInstallStageMeta,
  Head: KkInstallStageHead,
  Copy: KkInstallStageCopy,
  Steps: KkInstallStageSteps,
  Step: KkInstallStageStep,
  Actions: KkInstallStageActions,
});
