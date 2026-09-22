import { createFileRoute } from '@tanstack/react-router';
import { GroupKindEditScreen } from '@/features/manage-groups';

export const Route = createFileRoute('/_app/manage/groups_/kinds/$groupKindId_/edit')({
  component: GroupKindEditScreen,
});
