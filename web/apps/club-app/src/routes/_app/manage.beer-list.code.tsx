import { createFileRoute } from '@tanstack/react-router';
import { BeerCodePane } from '@/features/manage-beer-list/components/BeerCodePane';

export const Route = createFileRoute('/_app/manage/beer-list/code')({
  component: BeerCodePane,
});
