import { createFileRoute } from '@tanstack/react-router';
import { ClubContactScreen } from '@/features/manage-club-record';

export const Route = createFileRoute('/_app/manage/club-record_/contact')({
  component: ClubContactScreen,
});
