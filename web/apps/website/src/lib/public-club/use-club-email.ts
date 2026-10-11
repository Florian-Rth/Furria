import { readySourceData } from '@/lib/public-resource/public-source';
import { publicClub } from './api';

export const useClubEmail = (): string | null => {
  const data = readySourceData(publicClub.useSource());

  return data?.email ?? null;
};
