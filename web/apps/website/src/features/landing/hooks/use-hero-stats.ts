import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import type { HeroStat } from '../hero-content';
import { buildHeroStats } from '../hero-content';

export const useHeroStats = (): HeroStat[] => {
  const data = readySourceData(publicClub.useSource());

  return buildHeroStats(data);
};
