import { usePracticeHints } from '@/features/act-practice/hooks/use-practice-hints';
import type { StudioScreen } from './use-studio-screen';

export const useStudioHints = ({ frame, mode, practice }: StudioScreen): boolean =>
  usePracticeHints(
    frame.hero === 'video' && !mode.editing && !practice.playing && practice.canPlay,
  );
