import { KkEjPanelBlock } from './internal/layout/KkEjPanelBlock';
import { KkEjPanelDanger } from './internal/layout/KkEjPanelDanger';
import { KkEjPanelFrame } from './internal/layout/KkEjPanelFrame';
import { KkEjPanelGroup } from './internal/layout/KkEjPanelGroup';
import { KkEjPanelRoot } from './internal/layout/KkEjPanelRoot';
import { KkEjPanelTools } from './internal/layout/KkEjPanelTools';
import { KkEjPanelContext } from './internal/ui/KkEjPanelContext';
import { KkEjPanelGroupHead } from './internal/ui/KkEjPanelGroupHead';
import { KkEjPanelHead } from './internal/ui/KkEjPanelHead';
import { KkEjPanelNote } from './internal/ui/KkEjPanelNote';
import { KkEjPanelStepper } from './internal/ui/KkEjPanelStepper';

export const KkEjPanel = Object.assign(KkEjPanelRoot, {
  Block: KkEjPanelBlock,
  Context: KkEjPanelContext,
  Danger: KkEjPanelDanger,
  Frame: KkEjPanelFrame,
  Group: KkEjPanelGroup,
  GroupHead: KkEjPanelGroupHead,
  Head: KkEjPanelHead,
  Note: KkEjPanelNote,
  Stepper: KkEjPanelStepper,
  Tools: KkEjPanelTools,
});
