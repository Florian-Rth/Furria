import { createFileRoute } from '@tanstack/react-router';
import { GroupKindScreen } from '@/features/manage-groups';

export const Route = createFileRoute('/_app/manage/groups_/kinds/$groupKindId')({
  component: GroupKindScreen,
});
