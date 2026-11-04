import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  DEFAULT_MEMBER_VIEWER,
  memberLabValueOf,
  memberSearchOf,
} from '@/features/lab-beer-a/beer-a-lab';
import { BeerListAPage } from '@/features/lab-beer-a/components/BeerListAPage';
import { BeerAMemberSearchSchema } from '@/features/lab-beer-a/schemas';

const BeerListARoute: FC = () => {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const viewer = search.as ?? DEFAULT_MEMBER_VIEWER;
  const emptyStock = search.stock === 'empty';
  const switchLab = (choice: string): void => {
    void navigate({ search: memberSearchOf(choice, search), replace: true });
  };

  return (
    <BeerListAPage
      key={`${viewer}-${String(emptyStock)}`}
      viewer={viewer}
      emptyStock={emptyStock}
      labValue={memberLabValueOf(search)}
      onLabChange={switchLab}
    />
  );
};

export const Route = createFileRoute('/_app/lab_/beer-list-a')({
  validateSearch: BeerAMemberSearchSchema,
  component: BeerListARoute,
});
