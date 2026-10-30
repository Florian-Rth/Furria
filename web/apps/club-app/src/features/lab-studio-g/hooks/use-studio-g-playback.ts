import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { withKeyframeMovesOf } from '../studio-g-edits';
import type { StudioGEdits } from './use-studio-g-edits';

export const useStudioGPlayback = (
  edits: StudioGEdits,
  viewerId: number | null,
): StudioPlayback => {
  const playback = useStudioPlayback(edits.studio, viewerId);

  return { ...playback, paths: withKeyframeMovesOf(playback.paths, edits.moves) };
};
