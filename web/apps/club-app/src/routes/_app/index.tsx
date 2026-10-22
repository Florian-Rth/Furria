import { createFileRoute } from '@tanstack/react-router';
import { StartScreen } from '@/features/start/components/StartScreen';

export const Route = createFileRoute('/_app/')({ component: StartScreen });
