import { KkSplitLayoutPane } from './internal/layout/KkSplitLayoutPane';
import { KkSplitLayoutRoot } from './internal/layout/KkSplitLayoutRoot';
import { KkSplitLayoutStage } from './internal/layout/KkSplitLayoutStage';

export const KkSplitLayout = Object.assign(KkSplitLayoutRoot, {
  Stage: KkSplitLayoutStage,
  Pane: KkSplitLayoutPane,
});
