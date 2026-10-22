import { createFileRoute } from '@tanstack/react-router';
import { BoardOfficeEditScreen } from '@/features/manage-board/components/BoardOfficeEditScreen';
import { BoardOfficeEditSearchSchema } from '@/features/manage-board/schemas';

export const Route = createFileRoute('/_app/manage/board_/$boardOfficeId_/edit')({
  validateSearch: BoardOfficeEditSearchSchema,
  component: BoardOfficeEditScreen,
});
