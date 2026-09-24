import { createFileRoute } from '@tanstack/react-router';
import { PersonMembershipNewScreen } from '@/features/manage-persons';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/memberships/new')({
  component: PersonMembershipNewScreen,
});
