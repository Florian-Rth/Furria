import { readySourceData } from '@/lib/public-resource/public-source';
import { publicClub } from './api';

export const useClubAgeOfConsent = (): number | null => {
  const data = readySourceData(publicClub.useSource());

  return data?.ageOfConsent ?? null;
};
