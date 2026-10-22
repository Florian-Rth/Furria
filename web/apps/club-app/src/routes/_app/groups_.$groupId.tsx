import { createFileRoute } from '@tanstack/react-router';
import { HubPage } from '@/features/group-hub/components/HubPage';

export const Route = createFileRoute('/_app/groups_/$groupId')({ component: HubPage });
