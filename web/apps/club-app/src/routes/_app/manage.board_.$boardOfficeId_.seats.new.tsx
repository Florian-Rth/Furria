import { createFileRoute } from '@tanstack/react-router';
import { BoardSeatNewScreen } from '@/features/manage-board';

export const Route = createFileRoute('/_app/manage/board_/$boardOfficeId_/seats/new')({
  component: BoardSeatNewScreen,
});
