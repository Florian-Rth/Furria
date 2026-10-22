import { createFileRoute } from '@tanstack/react-router';
import { PersonsPage } from '@/features/manage-persons/components/PersonsPage';
import { PersonsSearchSchema } from '@/features/manage-persons/schemas';

export const Route = createFileRoute('/_app/manage/persons')({
  component: PersonsPage,
  validateSearch: PersonsSearchSchema,
});
