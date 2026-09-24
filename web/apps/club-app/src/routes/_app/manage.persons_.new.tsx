import { createFileRoute } from '@tanstack/react-router';
import { PersonNewScreen } from '@/features/manage-persons';

export const Route = createFileRoute('/_app/manage/persons_/new')({
  component: PersonNewScreen,
});
