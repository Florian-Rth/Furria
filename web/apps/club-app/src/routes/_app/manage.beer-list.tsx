import { createFileRoute } from '@tanstack/react-router';
import { BeerHubPage } from '@/features/manage-beer-list/components/BeerHubPage';

export const Route = createFileRoute('/_app/manage/beer-list')({
  component: BeerHubPage,
});
