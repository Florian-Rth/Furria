import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import { buildApplyEyebrow } from '../apply-content';

export const useApplyEyebrow = (): string => {
  const data = readySourceData(publicClub.useSource());

  return buildApplyEyebrow(data?.session.label);
};
