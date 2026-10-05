import { createFileRoute } from '@tanstack/react-router';
import { MembershipApplicationsPage } from '@/features/manage-membership-applications';

export const Route = createFileRoute('/_app/manage/applications')({
  component: MembershipApplicationsPage,
});
