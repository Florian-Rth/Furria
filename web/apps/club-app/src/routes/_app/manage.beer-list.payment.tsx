import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { BeerPaymentPane } from '@/features/manage-beer-list/components/BeerPaymentPane';
import { BeerPaneSearchSchema } from '@/features/manage-beer-list/schemas';

const BeerPaymentRoute: FC = () => {
  const { person } = Route.useSearch();

  return <BeerPaymentPane key={person ?? 0} initialPersonId={person ?? null} />;
};

export const Route = createFileRoute('/_app/manage/beer-list/payment')({
  validateSearch: BeerPaneSearchSchema,
  component: BeerPaymentRoute,
});
