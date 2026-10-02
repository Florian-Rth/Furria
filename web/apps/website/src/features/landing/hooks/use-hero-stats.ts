import { usePublicClubQuery } from '@/lib/public-club/api';
import type { HeroStat } from '../hero-content';
import { buildHeroStats } from '../hero-content';

export const useHeroStats = (): HeroStat[] => {
  const { data } = usePublicClubQuery();

  return buildHeroStats(data);
};
