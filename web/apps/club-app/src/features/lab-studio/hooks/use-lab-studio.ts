import type { UseQueryResult } from '@tanstack/react-query';
import { useActStudioQuery } from '@/features/acts/api';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';

export interface LabStudio {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  viewerId: number | null;
}

export const useLabStudio = (rawActId: string): LabStudio => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();

  return { actId, query, viewerId: me.data?.person?.id ?? null };
};
