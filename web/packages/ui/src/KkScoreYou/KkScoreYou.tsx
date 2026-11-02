import { KkScoreYouLead } from './internal/layout/KkScoreYouLead';
import { KkScoreYouRoot } from './internal/layout/KkScoreYouRoot';
import { KkScoreYouPlace } from './internal/ui/KkScoreYouPlace';

export const KkScoreYou = Object.assign(KkScoreYouRoot, {
  Lead: KkScoreYouLead,
  Place: KkScoreYouPlace,
});
