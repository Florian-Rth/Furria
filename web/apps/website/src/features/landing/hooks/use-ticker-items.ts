import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import type { TickerItem } from '../ticker-content';
import { buildTickerPhrases, repeatTickerPhrases } from '../ticker-content';

export const useTickerItems = (): TickerItem[] => {
  const data = readySourceData(publicClub.useSource());

  return repeatTickerPhrases(buildTickerPhrases(data?.session));
};
