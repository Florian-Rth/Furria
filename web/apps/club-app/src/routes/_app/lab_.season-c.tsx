import { createFileRoute } from '@tanstack/react-router';
import { SeasonCPage } from '@/features/lab-season-c/components/SeasonCPage';

export const Route = createFileRoute('/_app/lab_/season-c')({ component: SeasonCPage });
