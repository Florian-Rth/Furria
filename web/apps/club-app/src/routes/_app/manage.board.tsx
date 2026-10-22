import { createFileRoute } from '@tanstack/react-router';
import { BoardPage } from '@/features/manage-board/components/BoardPage';
import { BoardSearchSchema } from '@/features/manage-board/schemas';

export const Route = createFileRoute('/_app/manage/board')({
  validateSearch: BoardSearchSchema,
  component: BoardPage,
});
