import { createFileRoute } from '@tanstack/react-router';
import { GroupSettingsScreen } from '@/features/group-hub/components/GroupSettingsScreen';

export const Route = createFileRoute('/_app/groups_/$groupId_/settings')({
  component: GroupSettingsScreen,
});
