import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GroupsPage } from '@/features/groups/components/GroupsPage';
import { GROUPS_SECTION } from '@/features/session/app-sections';
import { RequireAffiliation } from '@/features/session/components/RequireAffiliation';

const GroupsRoute: FC = () => (
  <RequireAffiliation section={GROUPS_SECTION}>
    <GroupsPage />
  </RequireAffiliation>
);

export const Route = createFileRoute('/_app/groups')({ component: GroupsRoute });
