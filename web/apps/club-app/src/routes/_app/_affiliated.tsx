import { createFileRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { RequireAffiliation } from '@/features/session';

const AffiliatedLayout: FC = () => (
  <RequireAffiliation>
    <Outlet />
  </RequireAffiliation>
);

export const Route = createFileRoute('/_app/_affiliated')({ component: AffiliatedLayout });
