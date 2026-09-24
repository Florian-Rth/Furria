import { createFileRoute } from '@tanstack/react-router';
import { GroupSlotScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/slots/$slotId')({
  component: GroupSlotScreen,
});
