import { createFileRoute } from '@tanstack/react-router';
import { ClubPage } from '@/features/club';

export const Route = createFileRoute('/_app/club')({ component: ClubPage });
