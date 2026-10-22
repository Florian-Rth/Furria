import { createFileRoute } from '@tanstack/react-router';
import { PersonPauseNewScreen } from '@/features/manage-persons/components/PersonPauseNewScreen';
import { PauseNewSearchSchema } from '@/features/manage-persons/schemas';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/pauses/new')({
  component: PersonPauseNewScreen,
  validateSearch: PauseNewSearchSchema,
});
