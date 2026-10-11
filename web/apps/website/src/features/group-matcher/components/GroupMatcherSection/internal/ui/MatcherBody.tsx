import type { FC } from 'react';
import type { PublicSource } from '@/lib/public-resource/public-source';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { MatcherError } from './MatcherError';
import { MatcherLoading } from './MatcherLoading';
import { MatcherStepper } from './MatcherStepper';

interface MatcherBodyProps {
  source: PublicSource<GroupMatcher>;
}

export const MatcherBody: FC<MatcherBodyProps> = ({ source }) => {
  if (source.status === 'loading') {
    return <MatcherLoading />;
  }

  if (source.status === 'error') {
    return <MatcherError onRetry={source.retry} />;
  }

  return <MatcherStepper matcher={source.data} />;
};
