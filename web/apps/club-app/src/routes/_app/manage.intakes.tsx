import { createFileRoute } from '@tanstack/react-router';
import { IntakesPage } from '@/features/manage-intakes/components/IntakesPage';

export const Route = createFileRoute('/_app/manage/intakes')({ component: IntakesPage });
