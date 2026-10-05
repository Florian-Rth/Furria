import { usePublicClubQuery } from '@/lib/public-club/api';
import type { JoinStat } from '../join-content';
import { buildJoinStats } from '../join-content';

export const useJoinStats = (): JoinStat[] => {
  const { data } = usePublicClubQuery();

  return buildJoinStats(data);
};
