import { createFileRoute } from '@tanstack/react-router';
import { PersonInPersonInvitationScreen } from '@/features/manage-persons/components/PersonInPersonInvitationScreen';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/invitations/in-person')({
  component: PersonInPersonInvitationScreen,
});
