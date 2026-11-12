import type { PublicSource } from '@/lib/public-resource/public-source';
import { groupMatcher } from '../api';
import { presentGroupMatcherSource } from '../group-matcher-source';
import type { GroupMatcher } from '../types';

export const useGroupMatcherSource = (): PublicSource<GroupMatcher> | null =>
  presentGroupMatcherSource(groupMatcher.useSource());
