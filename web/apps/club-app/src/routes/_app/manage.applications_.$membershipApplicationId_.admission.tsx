import { createFileRoute } from '@tanstack/react-router';
import { MembershipApplicationAdmissionScreen } from '@/features/manage-membership-applications';

export const Route = createFileRoute(
  '/_app/manage/applications_/$membershipApplicationId_/admission',
)({
  component: MembershipApplicationAdmissionScreen,
});
