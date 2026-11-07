import { KkJobPanelBlock } from './internal/layout/KkJobPanelBlock';
import { KkJobPanelDanger } from './internal/layout/KkJobPanelDanger';
import { KkJobPanelFrame } from './internal/layout/KkJobPanelFrame';
import { KkJobPanelGroup } from './internal/layout/KkJobPanelGroup';
import { KkJobPanelRoot } from './internal/layout/KkJobPanelRoot';
import { KkJobPanelTools } from './internal/layout/KkJobPanelTools';
import { KkJobPanelContext } from './internal/ui/KkJobPanelContext';
import { KkJobPanelGroupHead } from './internal/ui/KkJobPanelGroupHead';
import { KkJobPanelHead } from './internal/ui/KkJobPanelHead';
import { KkJobPanelNote } from './internal/ui/KkJobPanelNote';
import { KkJobPanelStepper } from './internal/ui/KkJobPanelStepper';

export const KkJobPanel = Object.assign(KkJobPanelRoot, {
  Block: KkJobPanelBlock,
  Context: KkJobPanelContext,
  Danger: KkJobPanelDanger,
  Frame: KkJobPanelFrame,
  Group: KkJobPanelGroup,
  GroupHead: KkJobPanelGroupHead,
  Head: KkJobPanelHead,
  Note: KkJobPanelNote,
  Stepper: KkJobPanelStepper,
  Tools: KkJobPanelTools,
});
