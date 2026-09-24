import { createFileRoute } from '@tanstack/react-router';
import { BoardOfficeNewScreen } from '@/features/manage-board';

export const Route = createFileRoute('/_app/manage/board_/new')({
  component: BoardOfficeNewScreen,
});
