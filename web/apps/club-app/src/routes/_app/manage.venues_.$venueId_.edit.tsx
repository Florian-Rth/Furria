import { createFileRoute } from '@tanstack/react-router';
import { VenueEditScreen } from '@/features/manage-venues';

export const Route = createFileRoute('/_app/manage/venues_/$venueId_/edit')({
  component: VenueEditScreen,
});
