import { createFileRoute } from '@tanstack/react-router';
import { SessionNewScreen } from '@/features/manage-sessions/components/SessionNewScreen';
import { SessionNewSearchSchema } from '@/features/manage-sessions/schemas';

export const Route = createFileRoute('/_app/manage/sessions_/new')({
  component: SessionNewScreen,
  validateSearch: SessionNewSearchSchema,
});
