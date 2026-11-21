import { useWhatsAppReachQuery } from '../api';

export const useClubGroupReach = (isOffered: boolean): boolean =>
  useWhatsAppReachQuery(isOffered).data?.clubGroup ?? false;
