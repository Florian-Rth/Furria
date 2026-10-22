import { createFileRoute } from '@tanstack/react-router';
import { LabHubPage } from '@/features/lab/components/LabHubPage';

export const Route = createFileRoute('/_app/lab/')({ component: LabHubPage });
