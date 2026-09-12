import { createFileRoute } from '@tanstack/react-router';
import { PersonsPage } from '@/features/manage-persons';

export const Route = createFileRoute('/_app/manage/persons')({ component: PersonsPage });
