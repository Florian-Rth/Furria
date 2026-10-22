import { createFileRoute } from '@tanstack/react-router';
import { MemberPage } from '@/features/members/components/MemberPage';

export const Route = createFileRoute('/_app/_affiliated/members_/$personId')({
  component: MemberPage,
});
