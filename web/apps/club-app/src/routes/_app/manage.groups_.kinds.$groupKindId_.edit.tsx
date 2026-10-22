import { createFileRoute } from '@tanstack/react-router';
import { GroupKindEditScreen } from '@/features/manage-groups/components/GroupKindEditScreen';

export const Route = createFileRoute('/_app/manage/groups_/kinds/$groupKindId_/edit')({
  component: GroupKindEditScreen,
});
