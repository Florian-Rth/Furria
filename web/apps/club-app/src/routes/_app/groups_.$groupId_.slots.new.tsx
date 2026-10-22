import { createFileRoute } from '@tanstack/react-router';
import { GroupSlotNewScreen } from '@/features/group-hub/components/GroupSlotNewScreen';

export const Route = createFileRoute('/_app/groups_/$groupId_/slots/new')({
  component: GroupSlotNewScreen,
});
