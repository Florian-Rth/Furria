import { createFileRoute } from '@tanstack/react-router';
import { PersonMembershipNewScreen } from '@/features/manage-persons/components/PersonMembershipNewScreen';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/memberships/new')({
  component: PersonMembershipNewScreen,
});
