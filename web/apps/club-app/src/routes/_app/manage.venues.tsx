import { createFileRoute } from '@tanstack/react-router';
import { ManagedVenuesPage } from '@/features/manage-venues';

export const Route = createFileRoute('/_app/manage/venues')({
  component: ManagedVenuesPage,
});
