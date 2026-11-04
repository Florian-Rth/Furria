import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PourMemberScreen } from '@/features/lab-beer-b/components/PourMemberScreen';
import { isPourViewer, PourMemberSearchSchema } from '@/features/lab-beer-b/schemas';

const BeerListBRoute: FC = () => {
  const { as } = Route.useSearch();
  const navigate = Route.useNavigate();
  const chooseViewer = (id: string): void => {
    if (isPourViewer(id)) {
      void navigate({ search: { as: id } });
    }
  };

  return <PourMemberScreen key={as} viewer={as} onViewer={chooseViewer} />;
};

export const Route = createFileRoute('/_app/lab_/beer-list-b')({
  validateSearch: PourMemberSearchSchema,
  component: BeerListBRoute,
});
