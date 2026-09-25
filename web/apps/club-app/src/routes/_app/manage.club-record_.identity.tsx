import { createFileRoute } from '@tanstack/react-router';
import { ClubIdentityScreen } from '@/features/manage-club-record';

export const Route = createFileRoute('/_app/manage/club-record_/identity')({
  component: ClubIdentityScreen,
});
