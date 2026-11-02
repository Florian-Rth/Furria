import { KkScoreReadinessRoot } from './internal/layout/KkScoreReadinessRoot';
import { KkScoreReadinessBadge } from './internal/ui/KkScoreReadinessBadge';

export type { KkScoreReadinessState } from './internal/ui/KkScoreReadinessMark';

export const KkScoreReadiness = Object.assign(KkScoreReadinessRoot, {
  Badge: KkScoreReadinessBadge,
});
