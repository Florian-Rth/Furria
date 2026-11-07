import type { FinalPlace } from '@furria/studio/studio-final';
import { finalPlacesOf, placeIndexAt } from '@furria/studio/studio-final';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';

export interface FinalPlaces {
  places: FinalPlace[];
  currentIndex: number;
}

export const useFinalPlaces = (screen: StudioWorkScreen): FinalPlaces => {
  const { final, playback } = screen;
  const places = final.previewing
    ? finalPlacesOf(final.mix, final.placements, final.pending?.durationSeconds ?? 0)
    : [];
  const currentIndex = usePlaybackSelection(playback.player, (seconds) =>
    placeIndexAt(places, seconds),
  );

  return { places, currentIndex };
};
