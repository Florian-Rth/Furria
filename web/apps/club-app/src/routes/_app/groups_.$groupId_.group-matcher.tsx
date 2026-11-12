import { createFileRoute } from '@tanstack/react-router';
import { GroupMatcherScreen } from '@/features/group-matcher/components/GroupMatcherScreen';

export const Route = createFileRoute('/_app/groups_/$groupId_/group-matcher')({
  component: GroupMatcherScreen,
});
