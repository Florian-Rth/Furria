import { createFileRoute } from '@tanstack/react-router';
import { VenueNewScreen } from '@/features/manage-venues/components/VenueNewScreen';

export const Route = createFileRoute('/_app/manage/venues_/new')({
  component: VenueNewScreen,
});
