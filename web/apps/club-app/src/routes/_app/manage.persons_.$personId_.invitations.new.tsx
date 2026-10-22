import { createFileRoute } from '@tanstack/react-router';
import { PersonInvitationNewScreen } from '@/features/manage-persons/components/PersonInvitationNewScreen';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/invitations/new')({
  component: PersonInvitationNewScreen,
});
