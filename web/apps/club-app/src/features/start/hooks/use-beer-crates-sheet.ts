import { useBeerEnrollmentsQuery, useBeerStockQuery } from '@/features/manage-beer-list/api';
import type { BeerBookable } from '@/features/manage-beer-list/beer-hub';
import { bookableOf, listedDrinksOf } from '@/features/manage-beer-list/beer-hub';
import type { BeerStockDrink } from '@/features/manage-beer-list/schemas';

export type BeerCratesSheetState =
  | { kind: 'loading' }
  | { kind: 'failed'; error: Error; retry: () => void }
  | { kind: 'ready'; bookable: readonly BeerBookable[]; drinks: readonly BeerStockDrink[] };

export const useBeerCratesSheet = (beerPotId: number): BeerCratesSheetState => {
  const enrollmentsQuery = useBeerEnrollmentsQuery();
  const stockQuery = useBeerStockQuery(beerPotId);
  const enrollments = enrollmentsQuery.data?.enrollments;
  const drinks = stockQuery.data?.drinks;

  if (enrollments !== undefined && drinks !== undefined) {
    return { kind: 'ready', bookable: bookableOf(enrollments), drinks: listedDrinksOf(drinks) };
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
