import { createFileRoute } from '@tanstack/react-router';
import { ManageSessionsPage } from '@/features/manage-sessions';

export const Route = createFileRoute('/_app/manage/sessions')({
  component: ManageSessionsPage,
});
