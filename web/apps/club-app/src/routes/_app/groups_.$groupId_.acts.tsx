import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GroupActsPage } from '@/features/acts/components/GroupActsPage';
import { ActsSearchSchema } from '@/features/acts/schemas';

const GroupActsRoute: FC = () => {
  const { groupId } = Route.useParams();
  const search = Route.useSearch();

  return <GroupActsPage groupId={groupId} search={search} />;
};

export const Route = createFileRoute('/_app/groups_/$groupId_/acts')({
  validateSearch: ActsSearchSchema,
  component: GroupActsRoute,
});
