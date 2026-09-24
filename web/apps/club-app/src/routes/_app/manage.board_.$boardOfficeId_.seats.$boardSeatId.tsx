import { createFileRoute } from '@tanstack/react-router';
import { BoardSeatScreen } from '@/features/manage-board';

export const Route = createFileRoute('/_app/manage/board_/$boardOfficeId_/seats/$boardSeatId')({
  component: BoardSeatScreen,
});
