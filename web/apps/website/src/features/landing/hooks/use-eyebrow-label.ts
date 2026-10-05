import { usePublicClubQuery } from '@/lib/public-club/api';
import { buildEyebrowLabel } from '../hero-content';

export const useEyebrowLabel = (): string => {
  const { data } = usePublicClubQuery();

  return buildEyebrowLabel(data?.session.label);
};
