import { createFileRoute } from '@tanstack/react-router';
import { BeerStockPane } from '@/features/manage-beer-list/components/BeerStockPane';

export const Route = createFileRoute('/_app/manage/beer-list/stock')({
  component: BeerStockPane,
});
