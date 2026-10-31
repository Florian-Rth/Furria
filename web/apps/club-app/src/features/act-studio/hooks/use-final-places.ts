import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { FinalPlace } from '../studio-final';
import { finalPlacesOf, placeIndexAt } from '../studio-final';
import type { StudioScreen } from './use-studio-screen';

export interface FinalPlaces {
  places: FinalPlace[];
  currentIndex: number;
}

export const useFinalPlaces = (screen: StudioScreen): FinalPlaces => {
  const { final, playback } = screen;
  const places = final.previewing
    ? finalPlacesOf(final.mix, final.placements, final.pending?.durationSeconds ?? 0)
    : [];
  const currentIndex = usePlaybackSelection(playback.player, (seconds) =>
    placeIndexAt(places, seconds),
  );

  return { places, currentIndex };
};
