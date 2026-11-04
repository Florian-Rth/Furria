import { createFileRoute } from '@tanstack/react-router';
import { BeerSettingsPane } from '@/features/manage-beer-list/components/BeerSettingsPane';

export const Route = createFileRoute('/_app/manage/beer-list/settings')({
  component: BeerSettingsPane,
});
