import { KkStudioIDetailFacts } from './internal/layout/KkStudioIDetailFacts';
import { KkStudioIDetailRoot } from './internal/layout/KkStudioIDetailRoot';
import { KkStudioIDetailTop } from './internal/layout/KkStudioIDetailTop';
import { KkStudioIDetailAction } from './internal/ui/KkStudioIDetailAction';
import { KkStudioIDetailClose } from './internal/ui/KkStudioIDetailClose';
import { KkStudioIDetailFact } from './internal/ui/KkStudioIDetailFact';
import { KkStudioIDetailLine } from './internal/ui/KkStudioIDetailLine';
import { KkStudioIDetailNudge } from './internal/ui/KkStudioIDetailNudge';
import { KkStudioIDetailSlot } from './internal/ui/KkStudioIDetailSlot';
import { KkStudioIDetailTitle } from './internal/ui/KkStudioIDetailTitle';

export type { KkStudioIDetailPlacement } from './internal/layout/KkStudioIDetailRoot';

export const KkStudioIDetail = Object.assign(KkStudioIDetailRoot, {
  Top: KkStudioIDetailTop,
  Title: KkStudioIDetailTitle,
  Close: KkStudioIDetailClose,
  Facts: KkStudioIDetailFacts,
  Fact: KkStudioIDetailFact,
  Line: KkStudioIDetailLine,
  Slot: KkStudioIDetailSlot,
  Action: KkStudioIDetailAction,
  Nudge: KkStudioIDetailNudge,
});
