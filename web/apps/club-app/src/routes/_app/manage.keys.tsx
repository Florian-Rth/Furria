import { createFileRoute } from '@tanstack/react-router';
import { ManagedKeysPage } from '@/features/manage-keys/components/ManagedKeysPage';

export const Route = createFileRoute('/_app/manage/keys')({
  component: ManagedKeysPage,
});
