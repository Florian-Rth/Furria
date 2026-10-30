import { createFileRoute } from '@tanstack/react-router';
import { SeasonBPage } from '@/features/lab-season-b/components/SeasonBPage';

export const Route = createFileRoute('/_app/lab_/season-b')({ component: SeasonBPage });
