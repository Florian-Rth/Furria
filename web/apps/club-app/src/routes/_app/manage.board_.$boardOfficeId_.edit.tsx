import { createFileRoute } from '@tanstack/react-router';
import { BoardOfficeEditScreen, BoardOfficeEditSearchSchema } from '@/features/manage-board';

export const Route = createFileRoute('/_app/manage/board_/$boardOfficeId_/edit')({
  validateSearch: BoardOfficeEditSearchSchema,
  component: BoardOfficeEditScreen,
});
