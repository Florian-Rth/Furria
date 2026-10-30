import { createFileRoute } from '@tanstack/react-router';
import { SeasonAPage } from '@/features/lab-season-a/components/SeasonAPage';

export const Route = createFileRoute('/_app/lab_/season-a')({ component: SeasonAPage });
