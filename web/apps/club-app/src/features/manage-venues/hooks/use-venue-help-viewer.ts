import { useVenueHalls } from '@/features/hall-builder/hooks/use-venue-halls';

export interface VenueHelpViewer {
  drawsHalls: boolean;
}

export const useVenueHelpViewer = (venueId: number): VenueHelpViewer => {
  const halls = useVenueHalls(venueId);

  return { drawsHalls: halls.isVisible };
};
