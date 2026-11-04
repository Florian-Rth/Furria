import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  DEFAULT_MEMBER_VIEWER,
  memberLabValueOf,
  memberSearchOf,
} from '@/features/lab-beer-a/beer-a-lab';
import { BeerBookAPage } from '@/features/lab-beer-a/components/BeerBookAPage';
import { BeerAMemberSearchSchema } from '@/features/lab-beer-a/schemas';
import { AppFailure } from '@/features/session/components/AppFailure';

const BeerBookARoute: FC = () => {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const viewer = search.as ?? DEFAULT_MEMBER_VIEWER;
  const emptyStock = search.stock === 'empty';
  const switchLab = (choice: string): void => {
    void navigate({ search: memberSearchOf(choice, search), replace: true });
  };

  return (
    <BeerBookAPage
      key={`${viewer}-${String(emptyStock)}`}
      viewer={viewer}
      emptyStock={emptyStock}
      labValue={memberLabValueOf(search)}
      onLabChange={switchLab}
    />
  );
};

export const Route = createFileRoute('/lab-beer-book-a')({
  validateSearch: BeerAMemberSearchSchema,
  component: BeerBookARoute,
  errorComponent: AppFailure,
});
