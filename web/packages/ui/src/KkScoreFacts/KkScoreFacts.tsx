import { KkScoreFactsRoot } from './internal/layout/KkScoreFactsRoot';
import { KkScoreFactsAnswer } from './internal/ui/KkScoreFactsAnswer';
import { KkScoreFactsFact } from './internal/ui/KkScoreFactsFact';

export type { KkScoreAnswer } from './internal/ui/KkScoreFactsAnswer';

export const KkScoreFacts = Object.assign(KkScoreFactsRoot, {
  Fact: KkScoreFactsFact,
  Answer: KkScoreFactsAnswer,
});
