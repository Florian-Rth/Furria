import { createFileRoute } from '@tanstack/react-router';
import { BoardOfficePage } from '@/features/manage-board/components/BoardOfficePage';

export const Route = createFileRoute('/_app/manage/board_/$boardOfficeId')({
  component: BoardOfficePage,
});
