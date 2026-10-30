import { KkFocusLanesPlayhead } from '../KkFocusLanes/internal/ui/KkFocusLanesPlayhead';
import { KkFocusLanesWave } from '../KkFocusLanes/internal/ui/KkFocusLanesWave';
import { KkFocusOverviewRoot } from './internal/layout/KkFocusOverviewRoot';
import { KkFocusOverviewBand } from './internal/ui/KkFocusOverviewBand';
import { KkFocusOverviewBracket } from './internal/ui/KkFocusOverviewBracket';
import { KkFocusOverviewSpan } from './internal/ui/KkFocusOverviewSpan';

export type { KkFocusOverviewKey } from './internal/ui/KkFocusOverviewBracket';
export type { KkFocusOverviewEdgeSide } from './internal/ui/KkFocusOverviewEdge';

export const KkFocusOverview = Object.assign(KkFocusOverviewRoot, {
  Band: KkFocusOverviewBand,
  Wave: KkFocusLanesWave,
  Span: KkFocusOverviewSpan,
  Bracket: KkFocusOverviewBracket,
  Playhead: KkFocusLanesPlayhead,
});
