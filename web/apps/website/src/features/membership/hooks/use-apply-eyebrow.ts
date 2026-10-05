import { usePublicClubQuery } from '@/lib/public-club/api';
import { buildApplyEyebrow } from '../apply-content';

export const useApplyEyebrow = (): string => {
  const { data } = usePublicClubQuery();

  return buildApplyEyebrow(data?.session.label);
};
