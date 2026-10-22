import { createFileRoute } from '@tanstack/react-router';
import { PersonMembershipScreen } from '@/features/manage-persons/components/PersonMembershipScreen';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/memberships/$membershipId')({
  component: PersonMembershipScreen,
});
