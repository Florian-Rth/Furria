import { createFileRoute } from '@tanstack/react-router';
import { BeerEnrollmentsPane } from '@/features/manage-beer-list/components/BeerEnrollmentsPane';

export const Route = createFileRoute('/_app/manage/beer-list/enrollments')({
  component: BeerEnrollmentsPane,
});
