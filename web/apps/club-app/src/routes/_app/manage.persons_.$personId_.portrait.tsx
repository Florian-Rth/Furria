import { createFileRoute } from '@tanstack/react-router';
import { PersonPortraitScreen } from '@/features/manage-persons';

export const Route = createFileRoute('/_app/manage/persons_/$personId_/portrait')({
  component: PersonPortraitScreen,
});
