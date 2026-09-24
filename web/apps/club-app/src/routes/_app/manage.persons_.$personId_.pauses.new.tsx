import { createFileRoute } from '@tanstack/react-router';
import { PauseNewSearchSchema, PersonPauseNewScreen } from '@/features/manage-persons';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/pauses/new')({
  component: PersonPauseNewScreen,
  validateSearch: PauseNewSearchSchema,
});
