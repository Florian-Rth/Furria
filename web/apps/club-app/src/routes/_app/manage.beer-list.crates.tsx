import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { BeerCratesPane } from '@/features/manage-beer-list/components/BeerCratesPane';
import { BeerPaneSearchSchema } from '@/features/manage-beer-list/schemas';

const BeerCratesRoute: FC = () => {
  const { person } = Route.useSearch();

  return <BeerCratesPane key={person ?? 0} initialPersonId={person ?? null} />;
};

export const Route = createFileRoute('/_app/manage/beer-list/crates')({
  validateSearch: BeerPaneSearchSchema,
  component: BeerCratesRoute,
});
