import type { FC } from 'react';
import type { MatcherSource } from '../logic/use-matcher-source';
import { MatcherError } from './MatcherError';
import { MatcherLoading } from './MatcherLoading';
import { MatcherStepper } from './MatcherStepper';

interface MatcherBodyProps {
  source: MatcherSource;
}

export const MatcherBody: FC<MatcherBodyProps> = ({ source }) => {
  if (source.status === 'loading') {
    return <MatcherLoading />;
  }

  if (source.status === 'error') {
    return <MatcherError onRetry={source.retry} />;
  }

  return <MatcherStepper matcher={source.matcher} />;
};
