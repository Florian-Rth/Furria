import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PourHubScreen } from '@/features/lab-beer-b/components/PourHubScreen';
import { isPourViewer, PourHubSearchSchema } from '@/features/lab-beer-b/schemas';

const BeerHubBRoute: FC = () => {
  const { as } = Route.useSearch();
  const navigate = Route.useNavigate();
  const chooseViewer = (id: string): void => {
    if (isPourViewer(id)) {
      void navigate({ search: { as: id } });
    }
  };

  return <PourHubScreen key={as} viewer={as} onViewer={chooseViewer} />;
};

export const Route = createFileRoute('/_app/lab_/beer-hub-b')({
  validateSearch: PourHubSearchSchema,
  component: BeerHubBRoute,
});
