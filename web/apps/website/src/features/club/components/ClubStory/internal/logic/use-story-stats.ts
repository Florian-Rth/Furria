import type { StoryStat } from '@/features/club/story-content';
import { buildStoryStats } from '@/features/club/story-content';
import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';

export const useStoryStats = (): StoryStat[] => {
  const data = readySourceData(publicClub.useSource());

  return buildStoryStats(data);
};
