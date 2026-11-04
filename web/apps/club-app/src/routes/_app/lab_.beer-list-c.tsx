import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LedgerMemberPage } from '@/features/lab-beer-c/components/LedgerMemberPage';
import { LedgerMemberSearchSchema } from '@/features/lab-beer-c/schemas';

const BeerListCRoute: FC = () => {
  const { as } = Route.useSearch();

  return <LedgerMemberPage key={as} viewer={as} />;
};

export const Route = createFileRoute('/_app/lab_/beer-list-c')({
  validateSearch: LedgerMemberSearchSchema,
  component: BeerListCRoute,
});
