import { createFileRoute } from '@tanstack/react-router';
import { MembersPage } from '@/features/members/components/MembersPage';

export const Route = createFileRoute('/_app/_affiliated/members')({ component: MembersPage });
