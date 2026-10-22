import { createFileRoute } from '@tanstack/react-router';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';

export const Route = createFileRoute('/_app/$')({ component: ScreenNotFound });
