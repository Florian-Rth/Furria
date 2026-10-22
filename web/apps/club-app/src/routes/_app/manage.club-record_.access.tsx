import { createFileRoute } from '@tanstack/react-router';
import { ClubAccessScreen } from '@/features/manage-club-record/components/ClubAccessScreen';

export const Route = createFileRoute('/_app/manage/club-record_/access')({
  component: ClubAccessScreen,
});
