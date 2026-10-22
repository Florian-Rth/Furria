import { createFileRoute } from '@tanstack/react-router';
import { GroupCreateScreen } from '@/features/manage-groups/components/GroupCreateScreen';

export const Route = createFileRoute('/_app/manage/groups_/new')({
  component: GroupCreateScreen,
});
