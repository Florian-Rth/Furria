import { createFileRoute } from '@tanstack/react-router';
import { ClubRecordPage } from '@/features/manage-club-record';

export const Route = createFileRoute('/_app/manage/club-record')({
  component: ClubRecordPage,
});
