import { KkStudioGViewerBar } from './internal/layout/KkStudioGViewerBar';
import { KkStudioGViewerPane } from './internal/layout/KkStudioGViewerPane';
import { KkStudioGViewerRoot } from './internal/layout/KkStudioGViewerRoot';
import { KkStudioGViewerCaption } from './internal/ui/KkStudioGViewerCaption';
import { KkStudioGViewerSight } from './internal/ui/KkStudioGViewerSight';
import { KkStudioGViewerSwap } from './internal/ui/KkStudioGViewerSwap';

export type {
  KkStudioGViewerPanePlacement,
  KkStudioGViewerPaneRole,
} from './internal/layout/KkStudioGViewerPane';
export type { KkStudioGViewerSightOption } from './internal/ui/KkStudioGViewerSight';

export const KkStudioGViewer = Object.assign(KkStudioGViewerRoot, {
  Bar: KkStudioGViewerBar,
  Pane: KkStudioGViewerPane,
  Swap: KkStudioGViewerSwap,
  Sight: KkStudioGViewerSight,
  Caption: KkStudioGViewerCaption,
});
