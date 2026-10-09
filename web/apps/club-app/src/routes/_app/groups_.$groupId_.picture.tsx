import { createFileRoute } from '@tanstack/react-router';
import { GroupPictureScreen } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId_/picture')({
  component: GroupPictureScreen,
});
