import { createFileRoute } from '@tanstack/react-router';
import { MembershipApplicationAdmissionScreen } from '@/features/manage-membership-applications/components/MembershipApplicationAdmissionScreen';

export const Route = createFileRoute(
  '/_app/manage/applications_/$membershipApplicationId_/admission',
)({
  component: MembershipApplicationAdmissionScreen,
});
