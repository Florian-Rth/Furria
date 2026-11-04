import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { BEER_LIST_TITLE } from '@/features/beer-list/beer-list-copy';
import { BeerListPage } from '@/features/beer-list/components/BeerListPage';
import { MORE_ORIGIN } from '@/features/session/app-sections';
import { RequirePerson } from '@/features/session/components/RequirePerson';

const BeerListRoute: FC = () => (
  <RequirePerson title={BEER_LIST_TITLE} origin={MORE_ORIGIN}>
    <BeerListPage />
  </RequirePerson>
);

export const Route = createFileRoute('/_app/beer-list')({ component: BeerListRoute });
