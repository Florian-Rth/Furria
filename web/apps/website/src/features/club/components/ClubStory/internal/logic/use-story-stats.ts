import { usePublicGroupsQuery } from '@/features/club/api';
import type { StoryStat } from '@/features/club/story-content';
import { buildStoryStats } from '@/features/club/story-content';
import { currentSession, FOUNDING_YEAR, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';

export const useStoryStats = (): StoryStat[] => {
  const { data } = usePublicGroupsQuery();

  return buildStoryStats(
    FOUNDING_YEAR,
    MEMBER_COUNT_PLACEHOLDER,
    data?.length ?? null,
    currentSession.number,
  );
};
