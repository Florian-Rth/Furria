import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PourBookingPage } from '@/features/lab-beer-b/components/PourBookingPage';
import { isPourViewer, PourBookSearchSchema } from '@/features/lab-beer-b/schemas';

const BeerBookBRoute: FC = () => {
  const { as, stock } = Route.useSearch();
  const navigate = Route.useNavigate();
  const empty = stock === 'empty';
  const chooseLab = (id: string): void => {
    if (isPourViewer(id)) {
      void navigate({ search: { as: id } });
      return;
    }

    void navigate({ search: { as, stock: 'empty' } });
  };

  return (
    <PourBookingPage key={`${as}-${String(empty)}`} viewer={as} empty={empty} onLab={chooseLab} />
  );
};

export const Route = createFileRoute('/lab-beer-book-b')({
  validateSearch: PourBookSearchSchema,
  component: BeerBookBRoute,
});
