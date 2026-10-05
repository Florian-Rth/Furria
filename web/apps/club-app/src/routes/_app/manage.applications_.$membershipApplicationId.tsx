import { createFileRoute } from '@tanstack/react-router';
import { MembershipApplicationPage } from '@/features/manage-membership-applications';

export const Route = createFileRoute('/_app/manage/applications_/$membershipApplicationId')({
  component: MembershipApplicationPage,
});
