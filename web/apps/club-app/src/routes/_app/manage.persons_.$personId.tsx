import { createFileRoute } from '@tanstack/react-router';
import { PersonEditPage } from '@/features/manage-persons';

export const Route = createFileRoute('/_app/manage/persons_/$personId')({
  component: PersonEditPage,
});
