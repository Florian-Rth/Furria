import type { StoryStat } from '@/features/club/story-content';
import { buildStoryStats } from '@/features/club/story-content';
import { usePublicClubQuery } from '@/lib/public-club/api';

export const useStoryStats = (): StoryStat[] => {
  const { data } = usePublicClubQuery();

  return buildStoryStats(data);
};
