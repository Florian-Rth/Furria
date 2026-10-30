import { useState } from 'react';
import { useMyActsQuery } from '@/features/acts/api';
import type { ActPageSearch, ActStudioResponse } from '@/features/acts/schemas';
import type { ActCardView } from '../act-card-view';
import { actCardViewOf } from '../act-card-view';

export const useActCard = (
  data: ActStudioResponse,
  viewerId: number | null,
  search: ActPageSearch,
): ActCardView | null => {
  const [now] = useState(Date.now);
  const mine = useMyActsQuery();

  if (mine.isPending) {
    return null;
  }

  const summary = mine.data?.acts.find((act) => act.actId === data.act.actId);

  return actCardViewOf(data, summary, viewerId, search, now);
};
