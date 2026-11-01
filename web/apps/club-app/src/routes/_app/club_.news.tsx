import { createFileRoute } from '@tanstack/react-router';
import { ReadNewsPage } from '@/features/club-news/components/ReadNewsPage';

export const Route = createFileRoute('/_app/club_/news')({ component: ReadNewsPage });
