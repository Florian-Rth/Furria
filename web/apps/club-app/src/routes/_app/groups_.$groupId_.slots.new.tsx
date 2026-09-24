import { createFileRoute } from '@tanstack/react-router';
import { GroupSlotNewScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/slots/new')({
  component: GroupSlotNewScreen,
});
