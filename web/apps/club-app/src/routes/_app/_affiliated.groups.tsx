import { createFileRoute } from '@tanstack/react-router';
import { GroupsPage } from '@/features/groups';

export const Route = createFileRoute('/_app/_affiliated/groups')({ component: GroupsPage });
