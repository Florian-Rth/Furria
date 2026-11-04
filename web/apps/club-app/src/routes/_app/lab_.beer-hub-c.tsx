import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LedgerHubPage } from '@/features/lab-beer-c/components/LedgerHubPage';
import { LedgerHubSearchSchema } from '@/features/lab-beer-c/schemas';

const BeerHubCRoute: FC = () => {
  const { as } = Route.useSearch();

  return <LedgerHubPage key={as} viewer={as} />;
};

export const Route = createFileRoute('/_app/lab_/beer-hub-c')({
  validateSearch: LedgerHubSearchSchema,
  component: BeerHubCRoute,
});
