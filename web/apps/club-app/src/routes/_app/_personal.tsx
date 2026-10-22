import { createFileRoute, Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import { MORE_ORIGIN, PROFILE_TITLE } from '@/features/session/app-sections';
import { RequirePerson } from '@/features/session/components/RequirePerson';

const PersonalLayout: FC = () => (
  <RequirePerson title={PROFILE_TITLE} origin={MORE_ORIGIN}>
    <Outlet />
  </RequirePerson>
);

export const Route = createFileRoute('/_app/_personal')({ component: PersonalLayout });
