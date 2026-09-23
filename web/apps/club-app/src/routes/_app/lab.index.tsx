import { createFileRoute } from '@tanstack/react-router';
import { LabHubPage } from '@/features/lab';

export const Route = createFileRoute('/_app/lab/')({ component: LabHubPage });
