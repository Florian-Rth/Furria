import { createFileRoute } from '@tanstack/react-router';
import { PersonEditScreen } from '@/features/manage-persons';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/edit')({
  component: PersonEditScreen,
});
