import { createFileRoute } from '@tanstack/react-router';
import { HubPage } from '@/features/group-hub';

export const Route = createFileRoute('/_app/groups_/$groupId')({ component: HubPage });
