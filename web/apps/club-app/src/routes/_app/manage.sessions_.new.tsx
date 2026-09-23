import { createFileRoute } from '@tanstack/react-router';
import { SessionNewScreen, SessionNewSearchSchema } from '@/features/manage-sessions';

export const Route = createFileRoute('/_app/manage/sessions_/new')({
  component: SessionNewScreen,
  validateSearch: SessionNewSearchSchema,
});
