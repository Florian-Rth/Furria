import { createFileRoute } from '@tanstack/react-router';
import { GroupAdministrationScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/administration')({
  component: GroupAdministrationScreen,
});
