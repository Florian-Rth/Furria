import { createFileRoute } from '@tanstack/react-router';
import { GroupSlotScreen } from '@/features/group-hub/components/GroupSlotScreen';

export const Route = createFileRoute('/_app/groups_/$groupId_/slots/$slotId')({
  component: GroupSlotScreen,
});
