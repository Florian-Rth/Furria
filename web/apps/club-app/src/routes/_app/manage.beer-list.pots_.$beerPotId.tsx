import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { BeerClosedPotPane } from '@/features/manage-beer-list/components/BeerClosedPotPane';

const BeerClosedPotRoute: FC = () => {
  const { beerPotId } = Route.useParams();

  return <BeerClosedPotPane key={beerPotId} beerPotId={Number(beerPotId)} />;
};

export const Route = createFileRoute('/_app/manage/beer-list/pots_/$beerPotId')({
  component: BeerClosedPotRoute,
});
