import { createFileRoute } from '@tanstack/react-router';
import { IntakesPage } from '@/features/manage-intakes/components/IntakesPage';

export const Route = createFileRoute('/_app/manage/persons_/intakes')({ component: IntakesPage });
