import { createFileRoute } from '@tanstack/react-router';
import { BoardOfficeEditScreen } from '@/features/manage-board';

export const Route = createFileRoute('/_app/manage/board_/$boardOfficeId_/edit')({
  component: BoardOfficeEditScreen,
});
