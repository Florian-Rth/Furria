import { createFileRoute } from '@tanstack/react-router';
import { PersonEditPage } from '@/features/manage-persons/components/PersonEditPage';

export const Route = createFileRoute('/_app/manage/persons_/$personId')({
  component: PersonEditPage,
});
