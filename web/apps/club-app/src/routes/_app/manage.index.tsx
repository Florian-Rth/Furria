import { createFileRoute } from '@tanstack/react-router';
import { ManagePage } from '@/features/manage-hub';

export const Route = createFileRoute('/_app/manage/')({
  component: ManagePage,
});
