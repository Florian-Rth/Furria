import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LedgerBookPage } from '@/features/lab-beer-c/components/LedgerBookPage';
import { LedgerMemberSearchSchema } from '@/features/lab-beer-c/schemas';
import { AppFailure } from '@/features/session/components/AppFailure';

const BeerBookCRoute: FC = () => {
  const { as } = Route.useSearch();

  return <LedgerBookPage key={as} viewer={as} />;
};

export const Route = createFileRoute('/lab-beer-book-c')({
  validateSearch: LedgerMemberSearchSchema,
  component: BeerBookCRoute,
  errorComponent: AppFailure,
});
