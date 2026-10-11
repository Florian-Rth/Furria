import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import type { JoinStat } from '../join-content';
import { buildJoinStats } from '../join-content';

export const useJoinStats = (): JoinStat[] => {
  const data = readySourceData(publicClub.useSource());

  return buildJoinStats(data);
};
