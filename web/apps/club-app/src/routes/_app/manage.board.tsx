import { createFileRoute } from '@tanstack/react-router';
import { BoardPage } from '@/features/manage-board';

export const Route = createFileRoute('/_app/manage/board')({ component: BoardPage });
