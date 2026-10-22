import { createFileRoute } from '@tanstack/react-router';
import { GroupKindCreateScreen } from '@/features/manage-groups/components/GroupKindCreateScreen';

export const Route = createFileRoute('/_app/manage/groups_/kinds/new')({
  component: GroupKindCreateScreen,
});
