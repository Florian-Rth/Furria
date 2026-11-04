import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { BeerPersonPane } from '@/features/manage-beer-list/components/BeerPersonPane';

const BeerPersonRoute: FC = () => {
  const { personId } = Route.useParams();

  return <BeerPersonPane personId={Number(personId)} />;
};

export const Route = createFileRoute('/_app/manage/beer-list/persons/$personId')({
  component: BeerPersonRoute,
});
