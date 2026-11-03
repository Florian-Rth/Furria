import type { StudioScreen } from '@furria/studio/studio-screen';
import { usePracticeHints } from '@furria/studio/use-practice-hints';

export const useStudioHints = ({ frame, mode, practice }: StudioScreen): boolean =>
  usePracticeHints(
    frame.hero === 'video' && !mode.editing && !practice.playing && practice.canPlay,
  );
