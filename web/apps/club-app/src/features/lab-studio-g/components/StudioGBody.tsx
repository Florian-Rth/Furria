import { KkStudioGArrive } from '@furria/ui/KkStudioGArrive';
import type { FC } from 'react';
import { usePractice } from '@/features/act-practice/hooks/use-practice';
import { usePracticeMemory } from '@/features/act-practice/hooks/use-practice-memory';
import { usePracticeSteps } from '@/features/act-practice/hooks/use-practice-steps';
import { usePracticeVideo } from '@/features/act-practice/hooks/use-practice-video';
import type { Studio } from '@/features/acts/schemas';
import { useStudioGEdits } from '../hooks/use-studio-g-edits';
import type { StudioGMode } from '../hooks/use-studio-g-page';
import { useStudioGPlayback } from '../hooks/use-studio-g-playback';
import { useStudioGReturn } from '../hooks/use-studio-g-return';
import { StudioGEdit } from './StudioGEdit';
import { StudioGPractice } from './StudioGPractice';

interface StudioGBodyProps {
  actId: number;
  actName: string;
  studio: Studio;
  viewerId: number | null;
  mode: StudioGMode;
}

export const StudioGBody: FC<StudioGBodyProps> = ({ actId, actName, studio, viewerId, mode }) => {
  const edits = useStudioGEdits(studio);
  const playback = useStudioGPlayback(edits, viewerId);
  const practice = usePractice(playback);
  const video = usePracticeVideo(edits.studio, playback);
  const steps = usePracticeSteps(edits.studio, playback, practice);
  const returned = useStudioGReturn(mode);
  usePracticeMemory({ actId, personId: viewerId }, playback, practice.step?.stepId ?? null);

  if (mode === 'edit') {
    return (
      <StudioGEdit
        actName={actName}
        studio={edits.studio}
        playback={playback}
        edits={edits}
        practice={practice}
        video={video}
      />
    );
  }

  const practising = (
    <StudioGPractice
      studio={edits.studio}
      playback={playback}
      practice={practice}
      video={video}
      steps={steps}
    />
  );

  return returned ? <KkStudioGArrive>{practising}</KkStudioGArrive> : practising;
};
