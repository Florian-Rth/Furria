import { createFileRoute } from '@tanstack/react-router';
import { BeerPotsPane } from '@/features/manage-beer-list/components/BeerPotsPane';

export const Route = createFileRoute('/_app/manage/beer-list/pots')({
  component: BeerPotsPane,
});
