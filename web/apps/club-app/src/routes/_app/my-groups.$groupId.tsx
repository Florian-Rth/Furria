import { createFileRoute } from '@tanstack/react-router';
import { HubPage } from '@/features/group-hub';

export const Route = createFileRoute('/_app/my-groups/$groupId')({ component: HubPage });
