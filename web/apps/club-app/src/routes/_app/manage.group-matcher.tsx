import { createFileRoute } from '@tanstack/react-router';
import { GroupMatcherHubPage } from '@/features/manage-group-matcher/components/GroupMatcherHubPage';

export const Route = createFileRoute('/_app/manage/group-matcher')({
  component: GroupMatcherHubPage,
});
