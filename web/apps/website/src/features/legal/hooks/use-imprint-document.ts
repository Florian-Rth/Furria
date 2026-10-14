import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import { toImprintDocument } from '../imprint-content';
import type { LegalDocument } from '../types';

export interface ImprintView {
  imprint: LegalDocument;
  retryClub: (() => void) | null;
}

export const useImprintDocument = (): ImprintView => {
  const club = publicClub.useSource();

  return {
    imprint: toImprintDocument(readySourceData(club)),
    retryClub: club.status === 'error' ? club.retry : null,
  };
};
