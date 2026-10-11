import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import { buildEyebrowLabel } from '../hero-content';

export const useEyebrowLabel = (): string => {
  const data = readySourceData(publicClub.useSource());

  return buildEyebrowLabel(data?.session.label);
};
