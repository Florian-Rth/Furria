import type { FC } from 'react';
import type { MatcherResultView } from '../logic/matcher-result';
import { MatcherRanking } from './MatcherRanking';
import { MatcherResultEmpty } from './MatcherResultEmpty';
import { MatcherResultUnanswered } from './MatcherResultUnanswered';

interface MatcherResultBodyProps {
  view: MatcherResultView;
  summary: string;
}

export const MatcherResultBody: FC<MatcherResultBodyProps> = ({ view, summary }) => {
  if (view.kind === 'unanswered') {
    return <MatcherResultUnanswered summary={summary} />;
  }

  if (view.kind === 'empty') {
    return <MatcherResultEmpty excluded={view.excluded} />;
  }

  return <MatcherRanking view={view} summary={summary} />;
};
