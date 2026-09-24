import { createFileRoute } from '@tanstack/react-router';
import { SessionEditScreen } from '@/features/manage-sessions';

export const Route = createFileRoute('/_app/manage/sessions_/$sessionId/edit')({
  component: SessionEditScreen,
});
