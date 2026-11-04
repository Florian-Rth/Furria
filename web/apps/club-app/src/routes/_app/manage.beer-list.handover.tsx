import { createFileRoute } from '@tanstack/react-router';
import { BeerHandoverPane } from '@/features/manage-beer-list/components/BeerHandoverPane';

export const Route = createFileRoute('/_app/manage/beer-list/handover')({
  component: BeerHandoverPane,
});
