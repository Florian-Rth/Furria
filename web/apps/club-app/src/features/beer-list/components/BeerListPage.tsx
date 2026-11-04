import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { MORE_ORIGIN } from '@/features/session/app-sections';
import { BEER_LIST_TITLE } from '../beer-list-copy';
import { useBeerListPage } from '../hooks/use-beer-list-page';
import { BeerListBody } from './BeerListBody';
import { BeerListPending } from './BeerListPending';

export const BeerListPage: FC = () => {
  const page = useBeerListPage();
  const body =
    page.load.state === 'ready' ? (
      <BeerListBody page={page} />
    ) : (
      <BeerListPending load={page.load} />
    );

  return (
    <KkScreen kind="detail" title={BEER_LIST_TITLE} origin={MORE_ORIGIN}>
      {body}
    </KkScreen>
  );
};
