import { KkHubRow } from '@furria/ui/KkHubRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { BEER_LIST_PATH } from '@/features/session/app-sections';
import { BEER_LIST_TITLE } from '../beer-list-copy';
import { useBeerListEntry } from '../hooks/use-beer-list-entry';

export const BeerListHubRow: FC = () => {
  const entry = useBeerListEntry();

  if (!entry.visible) {
    return null;
  }

  return (
    <KkHubRow
      label={BEER_LIST_TITLE}
      icon="beer"
      meta={entry.meta}
      component={Link}
      to={BEER_LIST_PATH}
    />
  );
};
