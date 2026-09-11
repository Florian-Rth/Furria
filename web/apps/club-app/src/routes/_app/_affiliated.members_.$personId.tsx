import { createFileRoute } from '@tanstack/react-router';
import { MemberPage } from '@/features/members';

export const Route = createFileRoute('/_app/_affiliated/members_/$personId')({
  component: MemberPage,
});
