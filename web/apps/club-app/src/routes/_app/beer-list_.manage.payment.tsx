import { createFileRoute } from '@tanstack/react-router';
import { BeerPaneSearchSchema } from '@/features/manage-beer-list/pane-search';

export const Route = createFileRoute('/_app/beer-list_/manage/payment')({
  validateSearch: BeerPaneSearchSchema,
});
