import { createFileRoute } from '@tanstack/react-router';
import { ManagedKeysPage } from '@/features/manage-keys';

export const Route = createFileRoute('/_app/manage/keys')({
  component: ManagedKeysPage,
});
