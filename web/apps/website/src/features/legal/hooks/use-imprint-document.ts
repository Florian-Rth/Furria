import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import { toImprintDocument } from '../imprint-content';
import type { LegalDocument } from '../types';

export const useImprintDocument = (): LegalDocument => {
  const club = readySourceData(publicClub.useSource());

  return toImprintDocument(club);
};
