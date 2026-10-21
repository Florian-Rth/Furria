import { createFileRoute } from '@tanstack/react-router';
import { BoardPage, BoardSearchSchema } from '@/features/manage-board';

export const Route = createFileRoute('/_app/manage/board')({
  validateSearch: BoardSearchSchema,
  component: BoardPage,
});
