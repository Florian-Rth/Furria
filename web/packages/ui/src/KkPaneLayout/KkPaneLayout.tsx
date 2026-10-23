import { KkPaneLayoutMain } from './internal/layout/KkPaneLayoutMain';
import { KkPaneLayoutPane } from './internal/layout/KkPaneLayoutPane';
import { KkPaneLayoutPaneBody } from './internal/layout/KkPaneLayoutPaneBody';
import { KkPaneLayoutRoot } from './internal/layout/KkPaneLayoutRoot';
import { KkPaneLayoutPaneHead } from './internal/ui/KkPaneLayoutPaneHead';

export const KkPaneLayout = Object.assign(KkPaneLayoutRoot, {
  Main: KkPaneLayoutMain,
  Pane: KkPaneLayoutPane,
  PaneHead: KkPaneLayoutPaneHead,
  PaneBody: KkPaneLayoutPaneBody,
});
