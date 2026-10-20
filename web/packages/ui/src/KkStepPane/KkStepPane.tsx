import { KkStepPaneBody } from './internal/layout/KkStepPaneBody';
import { KkStepPaneFoot } from './internal/layout/KkStepPaneFoot';
import { KkStepPaneRoot } from './internal/layout/KkStepPaneRoot';
import { KkStepPaneTabs } from './internal/layout/KkStepPaneTabs';
import { KkStepPaneHead } from './internal/ui/KkStepPaneHead';
import { KkStepPaneTab } from './internal/ui/KkStepPaneTab';

export const KkStepPane = Object.assign(KkStepPaneRoot, {
  Head: KkStepPaneHead,
  Tabs: KkStepPaneTabs,
  Tab: KkStepPaneTab,
  Body: KkStepPaneBody,
  Foot: KkStepPaneFoot,
});
