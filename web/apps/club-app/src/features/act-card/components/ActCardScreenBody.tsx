import type { FC } from 'react';
import type { ActPageSearch, ActStudioResponse } from '@/features/acts/schemas';
import { useActCard } from '../hooks/use-act-card';
import { ActCardBody } from './ActCardBody';
import { ActCardSkeleton } from './ActCardSkeleton';

interface ActCardScreenBodyProps {
  data: ActStudioResponse;
  viewerId: number | null;
  search: ActPageSearch;
}

export const ActCardScreenBody: FC<ActCardScreenBodyProps> = ({ data, viewerId, search }) => {
  const view = useActCard(data, viewerId, search);

  return view === null ? <ActCardSkeleton /> : <ActCardBody view={view} />;
};
