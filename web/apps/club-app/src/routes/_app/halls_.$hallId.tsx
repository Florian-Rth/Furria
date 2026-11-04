import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { HallBuilderPage } from '@/features/hall-builder/components/HallBuilderPage';
import { HallBuilderSearchSchema } from '@/features/hall-builder/hall-builder-search';

const HallBuilderRoute: FC = () => {
  const { hallId } = Route.useParams();
  const search = Route.useSearch();

  return <HallBuilderPage hallId={hallId} search={search} />;
};

export const Route = createFileRoute('/_app/halls_/$hallId')({
  validateSearch: HallBuilderSearchSchema,
  component: HallBuilderRoute,
});
