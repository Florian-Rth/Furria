import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GroupsPage } from '@/features/groups';
import { GROUPS_SECTION, RequireAffiliation } from '@/features/session';

const GroupsRoute: FC = () => (
  <RequireAffiliation section={GROUPS_SECTION}>
    <GroupsPage />
  </RequireAffiliation>
);

export const Route = createFileRoute('/_app/groups')({ component: GroupsRoute });
