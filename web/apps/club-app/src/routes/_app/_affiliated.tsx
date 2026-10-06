import { createFileRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { CLUB_ORIGIN, RequireAffiliation } from '@/features/session';

const AffiliatedLayout: FC = () => (
  <RequireAffiliation origin={CLUB_ORIGIN}>
    <Outlet />
  </RequireAffiliation>
);

export const Route = createFileRoute('/_app/_affiliated')({ component: AffiliatedLayout });
