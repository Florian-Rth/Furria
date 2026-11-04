import { createFileRoute } from '@tanstack/react-router';
import { BeerBookPage } from '@/features/beer-list/components/BeerBookPage';
import { AppFailure } from '@/features/session/components/AppFailure';

export const Route = createFileRoute('/beer-list_/book')({
  component: BeerBookPage,
  errorComponent: AppFailure,
});
