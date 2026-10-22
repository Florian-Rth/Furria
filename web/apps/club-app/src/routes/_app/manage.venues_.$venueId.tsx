import { createFileRoute } from '@tanstack/react-router';
import { VenueScreen } from '@/features/manage-venues/components/VenueScreen';

export const Route = createFileRoute('/_app/manage/venues_/$venueId')({
  component: VenueScreen,
});
