import { createFileRoute } from '@tanstack/react-router';
import { ClubStageScreen } from '@/features/manage-club-record/components/ClubStageScreen';

export const Route = createFileRoute('/_app/manage/club-record_/stage')({
  component: ClubStageScreen,
});
