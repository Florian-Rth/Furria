import type { PublicSource } from '@/lib/public-resource/public-source';
import type { GroupMatcher } from './types';

export const presentGroupMatcherSource = (
  source: PublicSource<GroupMatcher | null>,
): PublicSource<GroupMatcher> | null => {
  if (source.status !== 'ready') {
    return source;
  }

  return source.data === null ? null : { status: 'ready', data: source.data };
};

export const countMatcherQuestions = (source: PublicSource<GroupMatcher>): number | null =>
  source.status === 'ready' ? source.data.questions.length : null;
