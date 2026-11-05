import { useBeerEnrollmentsQuery, useBeerStockQuery } from '@/features/manage-beer-list/api';
import type { BeerBookable } from '@/features/manage-beer-list/beer-hub';
import { bookableOf } from '@/features/manage-beer-list/beer-hub';

export type BeerCratesSheetState =
  | { kind: 'loading' }
  | { kind: 'failed'; error: Error; retry: () => void }
  | { kind: 'ready'; bookable: readonly BeerBookable[]; stock: number };

export const useBeerCratesSheet = (beerPotId: number): BeerCratesSheetState => {
  const enrollmentsQuery = useBeerEnrollmentsQuery();
  const stockQuery = useBeerStockQuery(beerPotId);
  const enrollments = enrollmentsQuery.data?.enrollments;
  const stock = stockQuery.data?.crates;

  if (enrollments !== undefined && stock !== undefined) {
    return { kind: 'ready', bookable: bookableOf(enrollments), stock };
  }

  const error = enrollmentsQuery.error ?? stockQuery.error;

  if (error !== null) {
    return {
      kind: 'failed',
      error,
      retry: () => {
        void enrollmentsQuery.refetch();
        void stockQuery.refetch();
      },
    };
  }

  return { kind: 'loading' };
};
