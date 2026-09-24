import { createFileRoute } from '@tanstack/react-router';
import { PersonPauseScreen } from '@/features/manage-persons';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/pauses/$pauseId')({
  component: PersonPauseScreen,
});
