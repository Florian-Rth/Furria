import { usePublicClubQuery } from '@/lib/public-club/api';
import type { TickerItem } from '../ticker-content';
import { buildTickerPhrases, repeatTickerPhrases } from '../ticker-content';

export const useTickerItems = (): TickerItem[] => {
  const { data } = usePublicClubQuery();

  return repeatTickerPhrases(buildTickerPhrases(data?.session));
};
