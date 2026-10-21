import { createFileRoute } from '@tanstack/react-router';
import { StartScreen } from '@/features/start';

export const Route = createFileRoute('/_app/')({ component: StartScreen });
