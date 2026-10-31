import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ActPageSearch, ActStudioResponse } from '@/features/acts/schemas';
import { useActCard } from '../hooks/use-act-card';
import { ActCardDetailTiles } from './ActCardDetailTiles';
import { ActCardHeader } from './ActCardHeader';
import { ActCardSkeleton } from './ActCardSkeleton';

interface ActCardDetailsHeadProps {
  data: ActStudioResponse;
  viewerId: number | null;
  search: ActPageSearch;
}

export const ActCardDetailsHead: FC<ActCardDetailsHeadProps> = ({ data, viewerId, search }) => {
  const view = useActCard(data, viewerId, search);

  if (view === null) {
    return <ActCardSkeleton />;
  }

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <ActCardHeader view={view} />
      <ActCardDetailTiles view={view} />
    </Stack>
  );
};
