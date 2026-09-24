import { createFileRoute } from '@tanstack/react-router';
import { HubPersonScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/people/$personId')({
  component: HubPersonScreen,
});
