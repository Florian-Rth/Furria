import { createFileRoute } from '@tanstack/react-router';
import { PersonPauseScreen } from '@/features/manage-persons/components/PersonPauseScreen';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/pauses/$pauseId')({
  component: PersonPauseScreen,
});
